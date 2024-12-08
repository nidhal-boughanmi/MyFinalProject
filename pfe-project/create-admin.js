const mysql = require('mysql');
const bcrypt = require('bcryptjs');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'ProjetPfeAgil'
});

// Fonction pour supprimer tous les utilisateurs admin existants
function deleteExistingAdmins() {
    return new Promise((resolve, reject) => {
        const query = "DELETE FROM Utilisateur WHERE roles = 'ADMIN'";
        db.query(query, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}

async function createAdmin() {
    try {
        // Mot de passe simple pour les tests
        const password = 'admin123';
        
        // Générer le hash de manière synchrone
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);
        
        console.log('Password:', password);
        console.log('Generated hash:', hashedPassword);

        // Supprimer les admins existants
        await deleteExistingAdmins();

        // Insérer le nouvel admin
        const insertQuery = `
            INSERT INTO Utilisateur (nom, prenom, telephone, mail, mot_de_passe, matricule, roles)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            'Admin',
            'System',
            '21612345678',
            'admin@pfe.tn',
            hashedPassword,
            '9999',
            'ADMIN'
        ];

        db.query(insertQuery, values, (err, result) => {
            if (err) {
                console.error('Error creating admin:', err);
            } else {
                console.log('Admin created successfully');
                console.log('Login credentials:');
                console.log('Email: admin@pfe.tn');
                console.log('Password: admin123');
            }
            db.end();
        });
    } catch (error) {
        console.error('Error:', error);
        db.end();
    }
}

createAdmin();
