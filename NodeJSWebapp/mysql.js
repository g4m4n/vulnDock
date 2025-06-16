const mysql = require('mysql2/promise');

// Configuración de la conexión
const dbConfig = {
  host: 'db',
  user: 'app_user',
  password: 'app_password',
  database: 'web_app'
};

// Conexión a la base de datos
async function connectDb() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('Conectado a la base de datos');
    return connection;
  } catch (error) {
    console.error('Error de conexión:', error);
    return null;
  }
}

// Función para ejecutar una consulta
async function queryDb(query, params = []) {
  const connection = await connectDb();
  if (!connection) return null;

  try {
    const [results] = await connection.execute(query, params);
    return results;
  } catch (error) {
    console.error('❌ Error en la consulta:', error);
    return null;
  } finally {
    await connection.end();
    console.log('🔌 Conexión cerrada');
  }
}

// Función para ejecutar una consulta
async function queryDb(query, params = []) {
  const connection = await connectDb();
  if (!connection) return null;

  try {
    const [results] = await connection.execute(query, params);
    return results;
  } catch (error) {
    console.error('Error en la consulta:', error);
    return null;
  } finally {
    await connection.end();
    console.log('Conexión cerrada');
  }
}

// Funciones de acceso a datos
async function insertUser(username, firstname, lastname, email, password, avatar) {
  const query = `
    INSERT INTO users (username, firstname, lastname, email, password, avatar)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const params = [username, firstname, lastname, email, password, avatar];
  return await queryDb(query, params);
}

async function getUserByUsername(username) {
  const query = `SELECT * FROM users WHERE username = ?`;
  return await queryDb(query, [username]);
}

module.exports = {
  queryDb,
  insertUser,
  getUserByUsername
};