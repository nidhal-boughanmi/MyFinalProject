const mysql = require('mysql');
const fs = require('fs');
const path = require('path');

// Première connexion sans sélectionner de base de données
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: ''
});

async function initDatabase() {
    try {
        // 1. Créer la base de données si elle n'existe pas
        console.log('Création de la base de données...');
        await new Promise((resolve, reject) => {
            connection.query('CREATE DATABASE IF NOT EXISTS ProjetPfeAgil', (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
        console.log('Base de données créée ou déjà existante');

        // 2. Utiliser la base de données
        await new Promise((resolve, reject) => {
            connection.query('USE ProjetPfeAgil', (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
        console.log('Base de données sélectionnée');

        // 3. Lire et exécuter le fichier database.sql
        console.log('Création des tables...');
        const sqlFile = fs.readFileSync(path.join(__dirname, '..', 'database.sql'), 'utf8');
        const statements = sqlFile.split(';').filter(stmt => stmt.trim());

        for (const statement of statements) {
            if (statement.trim()) {
                await new Promise((resolve, reject) => {
                    connection.query(statement, (err) => {
                        if (err) reject(err);
                        else resolve();
                    });
                });
            }
        }
        console.log('Tables créées avec succès');

        console.log('\nInitialisation de la base de données terminée!');
        console.log('Vous pouvez maintenant exécuter le script setup_test_data.js');

    } catch (error) {
        console.error('Erreur lors de l\'initialisation de la base de données:', error);
    } finally {
        connection.end();
    }
}

initDatabase();
