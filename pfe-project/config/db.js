const mysql = require('mysql');

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'ProjetPfeAgil',
    connectionLimit: 10
});

// Ajouter la colonne idUtilisateur si elle n'existe pas
const addUserIdColumn = () => {
    db.getConnection((err, connection) => {
        if (err) {
            console.error('Erreur de connexion à la base de données:', err);
            return;
        }

        const checkColumnQuery = `
            SELECT COUNT(*) as count 
            FROM information_schema.COLUMNS 
            WHERE TABLE_SCHEMA = 'ProjetPfeAgil' 
            AND TABLE_NAME = 'Commande' 
            AND COLUMN_NAME = 'idUtilisateur'
        `;

        connection.query(checkColumnQuery, (err, results) => {
            connection.release();
            if (err) {
                console.error('Erreur lors de la vérification de la colonne:', err);
                return;
            }

            if (results[0].count === 0) {
                const alterTableQuery = `
                    ALTER TABLE Commande
                    ADD COLUMN idUtilisateur BIGINT,
                    ADD CONSTRAINT fk_commande_utilisateur
                    FOREIGN KEY (idUtilisateur) REFERENCES Utilisateur(identifiant)
                `;

                db.query(alterTableQuery, (err) => {
                    if (err) {
                        console.error('Erreur lors de l\'ajout de la colonne:', err);
                    } else {
                        console.log('Colonne idUtilisateur ajoutée avec succès');
                    }
                });
            }
        });
    });
};

// Vérifier la connexion
db.getConnection((err, connection) => {
    if (err) {
        console.error('Erreur de connexion à la base de données:', err);
        return;
    }
    console.log('Connecté à la base de données MySQL');
    connection.release();
    addUserIdColumn();
});

module.exports = db;
