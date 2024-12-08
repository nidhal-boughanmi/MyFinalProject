const mysql = require('mysql');
const fs = require('fs');
const path = require('path');

// Create a connection to MySQL server (without database)
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: ''
});

// Read the SQL file
const sqlFile = fs.readFileSync(path.join(__dirname, '..', 'database.sql'), 'utf8');

// Split the SQL file into individual statements
const statements = sqlFile.split(';').filter(stmt => stmt.trim());

// Execute each statement
connection.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL server');

    // Execute statements sequentially
    statements.forEach(statement => {
        if (statement.trim()) {
            connection.query(statement, (err, results) => {
                if (err) {
                    console.error('Error executing statement:', err);
                    console.error('Statement:', statement);
                } else {
                    console.log('Successfully executed statement');
                }
            });
        }
    });

    // Close the connection after all statements are executed
    setTimeout(() => {
        connection.end();
        console.log('Database initialization completed');
    }, 2000);
});
