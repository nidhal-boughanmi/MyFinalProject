const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all products
router.get('/', (req, res) => {
    const query = 'SELECT * FROM Produit';
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: "Erreur lors de la récupération des produits" });
        }
        res.json(results);
    });
});

// Create new product
router.post('/', (req, res) => {
    const { nom, disponibilite, prix, CODPRD, LIBPRD, CODEMB, LIBEMB, TYPPRD } = req.body;
    const query = `
        INSERT INTO Produit (nom, disponibilite, prix, CODPRD, LIBPRD, CODEMB, LIBEMB, TYPPRD) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.query(query, [nom, disponibilite, prix, CODPRD, LIBPRD, CODEMB, LIBEMB, TYPPRD], (err, result) => {
        if (err) {
            return res.status(500).json({ error: "Erreur lors de la création du produit" });
        }
        res.status(201).json({ 
            message: "Produit créé avec succès", 
            id: result.insertId 
        });
    });
});

// Get product by ID
router.get('/:id', (req, res) => {
    const query = 'SELECT * FROM Produit WHERE idProduit = ?';
    db.query(query, [req.params.id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: "Erreur lors de la récupération du produit" });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: "Produit non trouvé" });
        }
        res.json(results[0]);
    });
});

// Update product
router.put('/:id', (req, res) => {
    const { nom, disponibilite, prix, CODPRD, LIBPRD, CODEMB, LIBEMB, TYPPRD } = req.body;
    const query = `
        UPDATE Produit 
        SET nom = ?, disponibilite = ?, prix = ?, 
            CODPRD = ?, LIBPRD = ?, CODEMB = ?, 
            LIBEMB = ?, TYPPRD = ?
        WHERE idProduit = ?
    `;
    
    db.query(query, [
        nom, disponibilite, prix, 
        CODPRD, LIBPRD, CODEMB, 
        LIBEMB, TYPPRD, req.params.id
    ], (err, result) => {
        if (err) {
            console.error('Erreur SQL UPDATE:', err);
            return res.status(500).json({ error: "Erreur lors de la mise à jour du produit" });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Produit non trouvé" });
        }
        res.json({ message: "Produit mis à jour avec succès" });
    });
});

module.exports = router;
