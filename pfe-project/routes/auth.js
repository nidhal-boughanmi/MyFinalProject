const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Login route
router.post('/login', async (req, res) => {
    const { email, mot_de_passe } = req.body;
    console.log('Login attempt:', { email, password_length: mot_de_passe?.length });

    if (!email || !mot_de_passe) {
        console.log('Missing credentials');
        return res.status(400).json({ error: "Email et mot de passe requis" });
    }

    try {
        const query = 'SELECT * FROM Utilisateur WHERE mail = ?';
        console.log('Executing query:', query.replace('?', `'${email}'`));
        
        db.query(query, [email], async (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: "Erreur de serveur" });
            }

            if (results.length === 0) {
                console.log('No user found with email:', email);
                return res.status(401).json({ error: "Email ou mot de passe incorrect" });
            }

            const user = results[0];
            console.log('Found user:', {
                id: user.identifiant,
                email: user.mail,
                role: user.roles,
                stored_password_hash: user.mot_de_passe,
                stored_password_length: user.mot_de_passe?.length
            });

            try {
                console.log('Attempting password comparison');
                console.log('Input password:', mot_de_passe);
                console.log('Stored hash:', user.mot_de_passe);
                
                const validPassword = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
                console.log('Password validation result:', validPassword);

                if (!validPassword) {
                    console.log('Invalid password for user:', email);
                    return res.status(401).json({ error: "Email ou mot de passe incorrect" });
                }

                const token = jwt.sign(
                    { userId: user.identifiant, role: user.roles },
                    'your_jwt_secret',
                    { expiresIn: '24h' }
                );

                console.log('Login successful for user:', {
                    id: user.identifiant,
                    email: user.mail,
                    role: user.roles
                });

                res.json({
                    token,
                    user: {
                        id: user.identifiant,
                        nom: user.nom,
                        prenom: user.prenom,
                        role: user.roles
                    }
                });
            } catch (bcryptError) {
                console.error('Bcrypt error:', bcryptError);
                return res.status(500).json({ error: "Erreur lors de la validation du mot de passe" });
            }
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: "Erreur de serveur" });
    }
});

// Registration route
router.post('/register', async (req, res) => {
    const { nom, prenom, telephone, email, mot_de_passe, matricule, roles } = req.body;
    
    // Validate required fields
    if (!nom || !prenom || !telephone || !email || !mot_de_passe || !matricule || !roles) {
        return res.status(400).json({ error: "Tous les champs sont requis" });
    }

    try {
        // Check if user already exists
        const checkQuery = 'SELECT * FROM Utilisateur WHERE mail = ?';
        db.query(checkQuery, [email], async (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: "Erreur de serveur" });
            }

            if (results.length > 0) {
                return res.status(400).json({ error: "Cet email est déjà utilisé" });
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(mot_de_passe, salt);

            // Insert new user
            const insertQuery = `
                INSERT INTO Utilisateur (nom, prenom, telephone, mail, mot_de_passe, matricule, roles)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;

            db.query(
                insertQuery,
                [nom, prenom, telephone, email, hashedPassword, matricule, roles],
                (err, result) => {
                    if (err) {
                        console.error('Error creating user:', err);
                        return res.status(500).json({ error: "Erreur lors de la création de l'utilisateur" });
                    }

                    res.status(201).json({ message: "Utilisateur créé avec succès" });
                }
            );
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: "Erreur serveur" });
    }
});

// Test route to check users
router.get('/test-users', (req, res) => {
    const query = 'SELECT identifiant, nom, prenom, mail, roles FROM Utilisateur';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: "Erreur de serveur" });
        }
        res.json(results);
    });
});

// Route temporaire pour voir les utilisateurs
router.get('/check-users', (req, res) => {
    const query = 'SELECT identifiant, nom, prenom, mail, roles FROM Utilisateur';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: "Erreur serveur" });
        }
        res.json(results);
    });
});

// Route temporaire pour voir les utilisateurs
router.get('/check-users', (req, res) => {
    const query = 'SELECT identifiant, nom, prenom, mail, roles FROM Utilisateur';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: "Erreur serveur" });
        }
        res.json(results);
    });
});

// Test route to verify password hashing
router.get('/test-hash', async (req, res) => {
    const password = 'commercial123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Test the original stored hash
    const storedHash = '$2a$10$AfqJUAuuTCvRAiPCRiUj0e1lT.Qcr1RpdSIzHOGcehzKYEvtmSfgO';
    const isMatch = await bcrypt.compare(password, storedHash);
    
    res.json({
        newHash: hashedPassword,
        storedHash: storedHash,
        doTheyMatch: isMatch,
        passwordUsed: password
    });
});

module.exports = router;
