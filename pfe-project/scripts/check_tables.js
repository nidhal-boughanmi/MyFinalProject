const mysql = require('mysql');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'ProjetPfeAgil'
});

db.connect((err) => {
    if (err) {
        console.error('Erreur de connexion:', err);
        return;
    }

    // Vérifier la structure de la table StationService
    db.query('DESCRIBE StationService', (err, results) => {
        if (err) {
            console.error('Erreur lors de la description de la table:', err);
            return;
        }
        console.log('Structure de la table StationService:');
        console.log(results);
        db.end();
    });
});
