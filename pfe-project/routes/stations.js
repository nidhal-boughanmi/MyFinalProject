const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all stations
router.get('/', (req, res) => {
    const query = 'SELECT * FROM StationService';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Erreur SQL GET all:', err);
            return res.status(500).json({ error: "Erreur lors de la récupération des stations" });
        }
        res.json(results);
    });
});

// Create new station
router.post('/', (req, res) => {
    const { nom, adresse } = req.body;
    console.log('Données reçues:', req.body);
    
    // Validation des données requises
    if (!nom || !adresse) {
        return res.status(400).json({ error: "Le nom et l'adresse sont requis" });
    }

    const query = 'INSERT INTO StationService (nom, adresse) VALUES (?, ?)';
    console.log('Query:', query);
    console.log('Params:', [nom, adresse]);
    
    db.query(query, [nom, adresse], (err, result) => {
        if (err) {
            console.error('Erreur SQL INSERT:', err);
            return res.status(500).json({ error: "Erreur lors de la création de la station", details: err.message });
        }
        res.status(201).json({ 
            message: "Station créée avec succès", 
            id: result.insertId 
        });
    });
});

// Get station by ID
router.get('/:id', (req, res) => {
    const query = 'SELECT * FROM StationService WHERE idStation = ?';
    db.query(query, [req.params.id], (err, results) => {
        if (err) {
            console.error('Erreur SQL GET by ID:', err);
            return res.status(500).json({ error: "Erreur lors de la récupération de la station" });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: "Station non trouvée" });
        }
        res.json(results[0]);
    });
});

// Update station
router.put('/:id', (req, res) => {
    console.log('PUT /stations/:id - Début de la requête');
    console.log('ID de la station:', req.params.id);
    console.log('Corps de la requête:', req.body);

    const { nom, adresse } = req.body;
    
    // Validation des données requises
    if (!nom || !adresse) {
        console.log('Validation échouée: nom ou adresse manquant');
        return res.status(400).json({ error: "Le nom et l'adresse sont requis" });
    }

    try {
        // First, check if the station exists
        db.query('SELECT * FROM StationService WHERE idStation = ?', [req.params.id], (err, results) => {
            if (err) {
                console.error('Erreur lors de la vérification de la station:', err);
                return res.status(500).json({ error: "Erreur lors de la vérification de la station" });
            }

            if (results.length === 0) {
                return res.status(404).json({ error: "Station non trouvée" });
            }

            // Station exists, proceed with update
            const query = `
                UPDATE StationService 
                SET nom = ?,
                    adresse = ?
                WHERE idStation = ?
            `;
            
            const params = [nom, adresse, req.params.id];

            console.log('Requête SQL:', query);
            console.log('Paramètres:', params);

            db.query(query, params, (err, result) => {
                if (err) {
                    console.error('Erreur SQL UPDATE:', err);
                    return res.status(500).json({ 
                        error: "Erreur lors de la mise à jour de la station", 
                        details: err.message,
                        sqlMessage: err.sqlMessage
                    });
                }
                
                console.log('Mise à jour réussie');
                res.json({ 
                    message: "Station mise à jour avec succès",
                    affectedRows: result.affectedRows
                });
            });
        });
    } catch (error) {
        console.error('Erreur lors du traitement:', error);
        res.status(500).json({ 
            error: "Erreur lors de la mise à jour de la station",
            details: error.message 
        });
    }
});

// Delete station
router.delete('/:id', (req, res) => {
    const query = 'DELETE FROM StationService WHERE idStation = ?';
    
    db.query(query, [req.params.id], (err, result) => {
        if (err) {
            console.error('Erreur SQL DELETE:', err);
            return res.status(500).json({ error: "Erreur lors de la suppression de la station", details: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Station non trouvée" });
        }
        res.json({ message: "Station supprimée avec succès" });
    });
});

module.exports = router;
