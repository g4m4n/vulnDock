const mysql = require('mysql2');

// Configuración de la conexión a la base de datos
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'my_database',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = db;
