const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const auth = require('../../middleware/auth');

// Middleware pour vérifier si l'utilisateur est admin
const isAdmin = (req, res, next) => {
    if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Accès refusé. Droits d\'administrateur requis.' });
    }
    next();
};

// Statistiques générales du tableau de bord
router.get('/stats', auth, isAdmin, async (req, res) => {
    try {
        const stats = {
            users: {},
            stations: {},
            commandes: {},
            reclamations: {}
        };

        // Statistiques des utilisateurs par rôle
        const userQuery = `
            SELECT roles, COUNT(*) as count 
            FROM Utilisateur 
            GROUP BY roles
        `;

        // Statistiques des commandes
        const commandeQuery = `
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN etat = 'En instance' THEN 1 ELSE 0 END) as en_instance,
                SUM(CASE WHEN etat = 'En cours' THEN 1 ELSE 0 END) as en_cours,
                SUM(CASE WHEN etat = 'Validée' THEN 1 ELSE 0 END) as validees
            FROM Commande
        `;

        // Statistiques des réclamations
        const reclamationQuery = `
            SELECT 
                type,
                COUNT(*) as total,
                SUM(CASE WHEN etat = 'En instance' THEN 1 ELSE 0 END) as en_instance,
                SUM(CASE WHEN etat = 'En cours' THEN 1 ELSE 0 END) as en_cours,
                SUM(CASE WHEN etat = 'Validée' THEN 1 ELSE 0 END) as validees
            FROM Reclamation
            GROUP BY type
        `;

        // Statistiques des stations
        const stationQuery = `
            SELECT 
                COUNT(*) as total_stations,
                COUNT(DISTINCT g.idGerant) as stations_avec_gerant
            FROM StationService s
            LEFT JOIN Gerant g ON s.idStation = g.idStation
        `;

        // Exécuter toutes les requêtes
        db.query(userQuery, (err, userResults) => {
            if (err) throw err;
            stats.users = userResults;

            db.query(commandeQuery, (err, commandeResults) => {
                if (err) throw err;
                stats.commandes = commandeResults[0];

                db.query(reclamationQuery, (err, reclamationResults) => {
                    if (err) throw err;
                    stats.reclamations = reclamationResults;

                    db.query(stationQuery, (err, stationResults) => {
                        if (err) throw err;
                        stats.stations = stationResults[0];

                        res.json(stats);
                    });
                });
            });
        });

    } catch (error) {
        res.status(500).json({ error: "Erreur lors de la récupération des statistiques" });
    }
});

// Récupérer les dernières activités
router.get('/activities', auth, isAdmin, (req, res) => {
    const query = `
        (SELECT 
            'commande' as type,
            idCommande as id,
            date as timestamp,
            CONCAT('Nouvelle commande - Ref: ', RefCommande) as description
        FROM Commande
        ORDER BY date DESC
        LIMIT 5)
        UNION ALL
        (SELECT 
            'reclamation' as type,
            idReclamation as id,
            date as timestamp,
            CONCAT('Nouvelle réclamation - Type: ', type) as description
        FROM Reclamation
        ORDER BY date DESC
        LIMIT 5)
        ORDER BY timestamp DESC
        LIMIT 10
    `;

    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: "Erreur lors de la récupération des activités" });
        }
        res.json(results);
    });
});

// Statistiques des commandes par période
router.get('/commandes/stats', auth, isAdmin, (req, res) => {
    const { periode } = req.query; // jour, semaine, mois
    let dateFilter = '';
    
    switch(periode) {
        case 'jour':
            dateFilter = 'DATE(date) = CURDATE()';
            break;
        case 'semaine':
            dateFilter = 'YEARWEEK(date) = YEARWEEK(CURDATE())';
            break;
        case 'mois':
            dateFilter = 'MONTH(date) = MONTH(CURDATE()) AND YEAR(date) = YEAR(CURDATE())';
            break;
        default:
            dateFilter = '1=1'; // Pas de filtre
    }

    const query = `
        SELECT 
            COUNT(*) as total,
            SUM(montant) as montant_total,
            etat,
            DATE(date) as date
        FROM Commande
        WHERE ${dateFilter}
        GROUP BY etat, DATE(date)
        ORDER BY date DESC
    `;

    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: "Erreur lors de la récupération des statistiques des commandes" });
        }
        res.json(results);
    });
});

// Statistiques des réclamations par station
router.get('/reclamations/stats', auth, isAdmin, (req, res) => {
    const query = `
        SELECT 
            s.nom as station,
            r.type,
            COUNT(*) as total,
            SUM(CASE WHEN r.etat = 'En instance' THEN 1 ELSE 0 END) as en_instance,
            SUM(CASE WHEN r.etat = 'En cours' THEN 1 ELSE 0 END) as en_cours,
            SUM(CASE WHEN r.etat = 'Validée' THEN 1 ELSE 0 END) as validees
        FROM Reclamation r
        JOIN Gerant g ON r.idGerant = g.idGerant
        JOIN StationService s ON g.idStation = s.idStation
        GROUP BY s.idStation, r.type
        ORDER BY s.nom, r.type
    `;

    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: "Erreur lors de la récupération des statistiques des réclamations" });
        }
        res.json(results);
    });
});

module.exports = router;
