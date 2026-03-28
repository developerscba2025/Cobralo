const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: '127.0.0.1', // Try IP instead of localhost
    user: 'root',
    password: '',
    database: 'cobralo_db',
    port: 3306
});

console.log('Attempting to connect to MySQL...');

connection.connect((err) => {
    if (err) {
        console.error('Connection failed:', err.message);
        console.error('Error code:', err.code);
        process.exit(1);
    }
    console.log('Successfully connected to MySQL!');
    connection.end();
    process.exit(0);
});
