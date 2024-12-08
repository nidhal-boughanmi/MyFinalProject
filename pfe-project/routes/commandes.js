const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

// Appliquer l'authentification à toutes les routes
router.use(auth);

// Get all commandes
router.get('/', (req, res) => {
    const query = `
        SELECT c.*, p.LIBPRD as nomProduit, p.prix 
        FROM Commande c 
        LEFT JOIN CommandeProduit cp ON c.idCommande = cp.idCommande
        LEFT JOIN Produit p ON cp.idProduit = p.idProduit
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Erreur SQL GET all:', err);
            return res.status(500).json({ error: "Erreur lors de la récupération des commandes" });
        }
        res.json(results);
    });
});

// Get commandes for current user
router.get('/user', (req, res) => {
    const userId = req.user.id;
    console.log('User ID from token:', userId);
    
    const query = `
        SELECT c.*, p.LIBPRD as nomProduit, p.prix 
        FROM Commande c 
        LEFT JOIN CommandeProduit cp ON c.idCommande = cp.idCommande
        LEFT JOIN Produit p ON cp.idProduit = p.idProduit 
        WHERE c.idUtilisateur = ?
        ORDER BY c.date DESC
    `;
    
    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Erreur SQL GET user commandes:', err);
            return res.status(500).json({ error: "Erreur lors de la récupération des commandes de l'utilisateur" });
        }
        console.log('Commandes trouvées:', results.length);
        res.json(results);
    });
});

// Create new commande
router.post('/', async (req, res) => {
    const { montant, etat, produits } = req.body;
    const userId = req.user.id;
    const RefCommande = 'CMD' + Date.now();

    console.log('POST /api/commandes', req.body);
    console.log('Creating commande for user:', userId);

    db.getConnection((err, connection) => {
        if (err) {
            console.error('Erreur de connexion:', err);
            return res.status(500).json({ error: "Erreur de connexion à la base de données" });
        }

        connection.beginTransaction(async (err) => {
            if (err) {
                connection.release();
                return res.status(500).json({ error: "Erreur lors du début de la transaction" });
            }

            try {
                // Créer la commande principale
                const mainCommandeResult = await new Promise((resolve, reject) => {
                    const query = `
                        INSERT INTO Commande (montant, date, etat, RefCommande, idUtilisateur) 
                        VALUES (?, NOW(), ?, ?, ?)
                    `;
                    connection.query(query, [montant, etat, RefCommande, userId], (err, result) => {
                        if (err) {
                            return reject(err);
                        }
                        resolve(result);
                    });
                });

                const idCommande = mainCommandeResult.insertId;

                // Insérer les produits de la commande
                for (const produit of produits) {
                    await new Promise((resolve, reject) => {
                        const query = `
                            INSERT INTO CommandeProduit (idCommande, idProduit, quantite, prix) 
                            VALUES (?, ?, ?, ?)
                        `;
                        connection.query(query, [idCommande, produit.idProduit, produit.quantite, produit.prix], (err, result) => {
                            if (err) {
                                return reject(err);
                            }
                            resolve(result);
                        });
                    });

                    // Update product stock
                    await new Promise((resolve, reject) => {
                        const updateStockQuery = 'UPDATE Produit SET quantite = quantite - ? WHERE idProduit = ?';
                        connection.query(updateStockQuery, [produit.quantite, produit.idProduit], (err) => {
                            if (err) reject(err);
                            else resolve();
                        });
                    });
                }

                connection.commit((err) => {
                    if (err) {
                        return connection.rollback(() => {
                            connection.release();
                            res.status(500).json({ error: "Erreur lors de la validation de la transaction" });
                        });
                    }

                    connection.release();
                    
                    // Émettre l'événement Socket.IO pour la nouvelle commande
                    const io = req.app.get('io');
                    io.emit('nouvelle-commande', {
                        idCommande: idCommande,
                        RefCommande: RefCommande,
                        montant: montant,
                        etat: etat,
                        date: new Date()
                    });

                    res.status(201).json({ 
                        message: "Commande créée avec succès",
                        idCommande,
                        RefCommande
                    });
                });

            } catch (error) {
                console.error('Erreur SQL Transaction:', error);
                return connection.rollback(() => {
                    connection.release();
                    res.status(500).json({ error: "Erreur lors de la création de la commande" });
                });
            }
        });
    });
});

// Get commande by ID
router.get('/:id', (req, res) => {
    const userId = req.user.id;
    const query = `
        SELECT c.*, p.LIBPRD as nomProduit, cp.quantite, cp.prix
        FROM Commande c
        LEFT JOIN CommandeProduit cp ON c.idCommande = cp.idCommande
        LEFT JOIN Produit p ON cp.idProduit = p.idProduit
        WHERE c.idCommande = ? AND (c.idUtilisateur = ? OR ? IN (SELECT identifiant FROM Utilisateur WHERE roles = 'ADMIN'))
    `;
    
    db.query(query, [req.params.id, userId, userId], (err, results) => {
        if (err) {
            console.error('Erreur SQL GET by ID:', err);
            return res.status(500).json({ error: "Erreur lors de la récupération de la commande" });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: "Commande non trouvée" });
        }
        res.json(results[0]);
    });
});

// Update commande status
router.put('/:id/status', (req, res) => {
    const { etat } = req.body;
    const userId = req.user.id;
    
    const checkQuery = `
        SELECT * FROM Commande c 
        WHERE c.idCommande = ? AND (c.idUtilisateur = ? OR ? IN (SELECT identifiant FROM Utilisateur WHERE roles = 'ADMIN'))
    `;
    
    db.query(checkQuery, [req.params.id, userId, userId], (err, results) => {
        if (err) {
            console.error('Erreur SQL check permission:', err);
            return res.status(500).json({ error: "Erreur lors de la vérification des permissions" });
        }
        
        if (results.length === 0) {
            return res.status(403).json({ error: "Non autorisé à modifier cette commande" });
        }
        
        const updateQuery = 'UPDATE Commande SET etat = ? WHERE idCommande = ?';
        db.query(updateQuery, [etat, req.params.id], (err, result) => {
            if (err) {
                console.error('Erreur SQL UPDATE status:', err);
                return res.status(500).json({ error: "Erreur lors de la mise à jour du statut" });
            }
            res.json({ message: "Statut mis à jour avec succès" });
        });
    });
});

// Get all products with stock levels
router.get('/products', (req, res) => {
    const query = `
        SELECT p.idProduit, p.nom, p.prix, p.quantite
        FROM Produit p
        ORDER BY p.nom ASC
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Erreur SQL GET products:', err);
            return res.status(500).json({ error: "Erreur lors de la récupération des produits" });
        }
        res.json(results);
    });
});

module.exports = router;
