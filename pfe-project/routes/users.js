const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/db');

// Get all users
router.get('/', (req, res) => {
    const query = 'SELECT identifiant, nom, prenom, telephone, mail, matricule, roles FROM Utilisateur';
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: "Erreur lors de la récupération des utilisateurs" });
        }
        res.json(results);
    });
});

// Create new user
router.post('/', async (req, res) => {
    const { nom, prenom, telephone, mail, mot_de_passe, matricule, roles } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(mot_de_passe, 10);
        const query = 'INSERT INTO Utilisateur (nom, prenom, telephone, mail, mot_de_passe, matricule, roles) VALUES (?, ?, ?, ?, ?, ?, ?)';
        
        db.query(query, [nom, prenom, telephone, mail, hashedPassword, matricule, roles], (err, result) => {
            if (err) {
                return res.status(500).json({ error: "Erreur lors de la création de l'utilisateur" });
            }
            res.status(201).json({ message: "Utilisateur créé avec succès", id: result.insertId });
        });
    } catch (error) {
        res.status(500).json({ error: "Erreur lors du hashage du mot de passe" });
    }
});

// Get user by ID
router.get('/:id', (req, res) => {
    const query = 'SELECT identifiant, nom, prenom, telephone, mail, matricule, roles FROM Utilisateur WHERE identifiant = ?';
    db.query(query, [req.params.id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: "Erreur lors de la récupération de l'utilisateur" });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: "Utilisateur non trouvé" });
        }
        res.json(results[0]);
    });
});

// Update user
router.put('/:id', async (req, res) => {
    const { nom, prenom, telephone, mail, matricule, roles } = req.body;
    const query = 'UPDATE Utilisateur SET nom = ?, prenom = ?, telephone = ?, mail = ?, matricule = ?, roles = ? WHERE identifiant = ?';
    
    db.query(query, [nom, prenom, telephone, mail, matricule, roles, req.params.id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: "Erreur lors de la mise à jour de l'utilisateur" });
        }
        res.json({ message: "Utilisateur mis à jour avec succès" });
    });
});

// Get users by role
router.get('/role/:role', (req, res) => {
    const query = 'SELECT identifiant, nom, prenom, telephone, mail, matricule, roles FROM Utilisateur WHERE roles = ?';
    db.query(query, [req.params.role], (err, results) => {
        if (err) {
            return res.status(500).json({ error: "Erreur lors de la récupération des utilisateurs" });
        }
        res.json(results);
    });
});

module.exports = router;
