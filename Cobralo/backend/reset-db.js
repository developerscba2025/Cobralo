const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    port: 3306
});

console.log('Connecting to MySQL...');

connection.query('DROP DATABASE IF EXISTS cobralo_db', (err) => {
    if (err) {
        console.error('Error dropping DB:', err.message);
        process.exit(1);
    }
    console.log('Database dropped successfully.');

    connection.query('CREATE DATABASE cobralo_db', (err) => {
        if (err) {
            console.error('Error creating DB:', err.message);
            process.exit(1);
        }
        console.log('Database created successfully.');
        connection.end();
        process.exit(0);
    });
});
