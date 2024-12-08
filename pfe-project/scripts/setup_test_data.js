const mysql = require('mysql');
const bcrypt = require('bcryptjs');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'ProjetPfeAgil'
});

async function setupTestData() {
    try {
        // Connexion à la base de données
        db.connect();

        // 1. Créer la station test
        console.log('Création de la station test...');
        const stationResult = await new Promise((resolve, reject) => {
            const query = `
                INSERT INTO StationService (idStation, nom, adresse)
                VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE
                nom = VALUES(nom),
                adresse = VALUES(adresse)
            `;
            
            db.query(query, [
                1,
                'Station Test',
                '123 Rue de Test'
            ], (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
        console.log('Station créée avec succès');

        // 2. Créer l'utilisateur gérant
        console.log('Création du gérant test...');
        const password = 'Test123!';
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const userResult = await new Promise((resolve, reject) => {
            const query = `
                INSERT INTO Utilisateur (nom, prenom, telephone, mail, mot_de_passe, matricule, roles)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                nom = VALUES(nom),
                prenom = VALUES(prenom),
                telephone = VALUES(telephone),
                mot_de_passe = VALUES(mot_de_passe),
                roles = VALUES(roles)
            `;
            
            db.query(query, [
                'Gérant',
                'Test',
                '12345678',
                'gerant.test@station.com',
                hashedPassword,
                123456,
                'GERANT'
            ], (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
        
        const gerantId = userResult.insertId;
        console.log('Utilisateur gérant créé avec ID:', gerantId);

        // 3. Créer l'entrée dans la table Gerant
        console.log('Création des informations du gérant...');
        await new Promise((resolve, reject) => {
            const query = `
                INSERT INTO Gerant (idGerant, nom, prenom, matricule, numGerant, idStation)
                VALUES (?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                nom = VALUES(nom),
                prenom = VALUES(prenom),
                matricule = VALUES(matricule),
                numGerant = VALUES(numGerant),
                idStation = VALUES(idStation)
            `;
            
            db.query(query, [
                gerantId,
                'Gérant',
                'Test',
                123456,
                789012,
                1
            ], (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
        console.log('Informations du gérant créées avec succès');

        console.log('\nConfiguration terminée avec succès!');
        console.log('Vous pouvez maintenant vous connecter avec:');
        console.log('Email: gerant.test@station.com');
        console.log('Mot de passe: Test123!');

    } catch (error) {
        console.error('Erreur lors de la configuration:', error);
    } finally {
        db.end();
    }
}

setupTestData();
