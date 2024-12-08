const mysql = require('mysql');
const fs = require('fs');
const path = require('path');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'ProjetPfeAgil',
    multipleStatements: true
});

db.connect((err) => {
    if (err) {
        console.error('Erreur de connexion:', err);
        return;
    }
    console.log('Connecté à la base de données MySQL');

    // Lire les fichiers SQL
    const sqlFiles = [
        path.join(__dirname, '..', 'sql', 'create_commande_produit.sql'),
        path.join(__dirname, '..', 'sql', 'add_quantite_column.sql'),
        path.join(__dirname, '..', 'sql', 'update_product_quantities.sql')
    ];

    // Exécuter chaque fichier SQL
    sqlFiles.forEach(sqlPath => {
        const sql = fs.readFileSync(sqlPath, 'utf8');
        db.query(sql, (err, results) => {
            if (err) {
                console.error(`Erreur lors de l'exécution de ${path.basename(sqlPath)}:`, err);
            } else {
                console.log(`${path.basename(sqlPath)} exécuté avec succès`);
            }
        });
    });

    // Fermer la connexion après un délai pour s'assurer que toutes les requêtes sont terminées
    setTimeout(() => {
        db.end();
        console.log('Connexion fermée');
    }, 1000);
});
