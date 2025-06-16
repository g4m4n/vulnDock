const { Pool } = require('pg');

const pool = new Pool({
  host: 'db',
  user: 'admin',
  password: 'admin',
  database: 'web_app',
  port: 5432
});

async function queryDb(query, params = []) {
  const client = await pool.connect();

  try {
    const res = await client.query(query, params);
    return res.rows;
  } catch (error) {
    console.error('Error en consulta PostgreSQL:', error);
    return null;
  } finally {
    client.release();
    console.log('Conexión PostgreSQL liberada');
  }
}

// Funciones ejemplo
async function insertUser(username, firstname, lastname, email, password, avatar) {
  const query = `
    INSERT INTO users (username, firstname, lastname, email, password, avatar)
    VALUES ($1, $2, $3, $4, $5, $6)
  `;
  const params = [username, firstname, lastname, email, password, avatar];
  return await queryDb(query, params);
}

async function getUserByUsername(username) {
  const query = `SELECT * FROM users WHERE username = $1`;
  return await queryDb(query, [username]);
}

module.exports = {
  queryDb,
  insertUser,
  getUserByUsername
};
