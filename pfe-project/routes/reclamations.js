const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

// Get all reclamations
router.get('/', auth, (req, res) => {
    const query = `
        SELECT r.*, 
               u1.nom as nom_gerant, u1.prenom as prenom_gerant,
               u2.nom as nom_commercial, u2.prenom as prenom_commercial
        FROM Reclamation r
        LEFT JOIN Utilisateur u1 ON r.idGerant = u1.identifiant
        LEFT JOIN Utilisateur u2 ON r.idCommercial = u2.identifiant
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Erreur SQL GET all:', err);
            return res.status(500).json({ error: "Erreur lors de la récupération des réclamations" });
        }
        res.json(results);
    });
});

// Get reclamations for current user
router.get('/user', auth, (req, res) => {
    const userId = req.user.id;
    const userRole = req.user.role;
    console.log('User ID from token:', userId, 'Role:', userRole);
    
    let query = `
        SELECT r.*, 
               u1.nom as nom_gerant, u1.prenom as prenom_gerant,
               u2.nom as nom_commercial, u2.prenom as prenom_commercial
        FROM Reclamation r
        LEFT JOIN Utilisateur u1 ON r.idGerant = u1.identifiant
        LEFT JOIN Utilisateur u2 ON r.idCommercial = u2.identifiant
        WHERE 1=0
    `;
    
    const queryParams = [];
    
    // Adapter la requête en fonction du rôle
    if (userRole === 'GERANT') {
        query = query.replace('WHERE 1=0', 'WHERE r.idGerant = ?');
        queryParams.push(userId);
    } else if (userRole === 'COMMERCIAL') {
        query = query.replace('WHERE 1=0', 'WHERE r.idCommercial = ?');
        queryParams.push(userId);
    } else if (userRole === 'ADMIN') {
        query = query.replace('WHERE 1=0', 'WHERE 1=1'); // Voir toutes les réclamations
    }
    
    query += ' ORDER BY r.date DESC';
    
    db.query(query, queryParams, (err, results) => {
        if (err) {
            console.error('Erreur SQL GET user reclamations:', err);
            return res.status(500).json({ error: "Erreur lors de la récupération des réclamations de l'utilisateur" });
        }
        console.log('Réclamations trouvées:', results.length);
        res.json(results);
    });
});

// Create new reclamation
router.post('/', auth, (req, res) => {
    const { idGerant, description, type, material } = req.body;
    const idCommercial = req.user.role === 'COMMERCIAL' ? req.user.id : null;
    
    console.log('Creating reclamation:', { idGerant, idCommercial, description, type, material });
    
    if (!idGerant || !description || !type) {
        return res.status(400).json({ error: "Tous les champs obligatoires doivent être remplis" });
    }

    const query = `
        INSERT INTO Reclamation 
        (idGerant, idCommercial, description, date, type, etat, material) 
        VALUES (?, ?, ?, NOW(), ?, 'En instance', ?)
    `;
    
    db.query(query, [idGerant, idCommercial, description, type, material], (err, result) => {
        if (err) {
            console.error('Erreur SQL INSERT:', err);
            return res.status(500).json({ error: "Erreur lors de la création de la réclamation" });
        }

        // Récupérer la réclamation nouvellement créée
        const getNewReclamationQuery = `
            SELECT r.*, 
                   u1.nom as nom_gerant, u1.prenom as prenom_gerant,
                   u2.nom as nom_commercial, u2.prenom as prenom_commercial
            FROM Reclamation r
            LEFT JOIN Utilisateur u1 ON r.idGerant = u1.identifiant
            LEFT JOIN Utilisateur u2 ON r.idCommercial = u2.identifiant
            WHERE r.idReclamation = ?
        `;

        db.query(getNewReclamationQuery, [result.insertId], (err, reclamation) => {
            if (err) {
                console.error('Erreur lors de la récupération de la nouvelle réclamation:', err);
                return res.status(201).json({ message: "Réclamation créée avec succès", id: result.insertId });
            }
            res.status(201).json({ 
                message: "Réclamation créée avec succès",
                id: result.insertId,
                reclamation: reclamation[0]
            });
        });
    });
});

// Get reclamation by ID
router.get('/:id', auth, (req, res) => {
    const userId = req.user.id;
    const userRole = req.user.role;
    
    const query = `
        SELECT r.*, 
               u1.nom as nom_gerant, u1.prenom as prenom_gerant,
               u2.nom as nom_commercial, u2.prenom as prenom_commercial
        FROM Reclamation r
        LEFT JOIN Utilisateur u1 ON r.idGerant = u1.identifiant
        LEFT JOIN Utilisateur u2 ON r.idCommercial = u2.identifiant
        WHERE r.idReclamation = ? 
        AND (
            r.idGerant = ? 
            OR r.idCommercial = ? 
            OR ? IN (SELECT identifiant FROM Utilisateur WHERE roles = 'ADMIN')
        )
    `;
    
    db.query(query, [req.params.id, userId, userId, userId], (err, results) => {
        if (err) {
            console.error('Erreur SQL GET by ID:', err);
            return res.status(500).json({ error: "Erreur lors de la récupération de la réclamation" });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: "Réclamation non trouvée ou accès non autorisé" });
        }
        res.json(results[0]);
    });
});

// Update reclamation status
router.put('/:id/status', auth, (req, res) => {
    const { etat } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    // Vérifier les permissions
    const checkQuery = `
        SELECT * FROM Reclamation r 
        WHERE r.idReclamation = ? 
        AND (
            r.idGerant = ? 
            OR r.idCommercial = ? 
            OR ? IN (SELECT identifiant FROM Utilisateur WHERE roles = 'ADMIN')
        )
    `;
    
    db.query(checkQuery, [req.params.id, userId, userId, userId], (err, results) => {
        if (err) {
            console.error('Erreur SQL check permission:', err);
            return res.status(500).json({ error: "Erreur lors de la vérification des permissions" });
        }
        
        if (results.length === 0) {
            return res.status(403).json({ error: "Non autorisé à modifier cette réclamation" });
        }
        
        const updateQuery = 'UPDATE Reclamation SET etat = ? WHERE idReclamation = ?';
        db.query(updateQuery, [etat, req.params.id], (err, result) => {
            if (err) {
                console.error('Erreur SQL UPDATE status:', err);
                return res.status(500).json({ error: "Erreur lors de la mise à jour du statut" });
            }
            res.json({ message: "Statut mis à jour avec succès" });
        });
    });
});

module.exports = router;
