const sql = require('mssql');

const dbConfig = {
  user: 'sa',
  password: 'YourStrong!Passw0rd',
  server: 'db', // o IP o hostname
  database: 'web_app',
  options: {
    encrypt: true, // si usas Azure, etc.
    trustServerCertificate: true // para dev local sin certificado
  }
};

async function connectDb() {
  try {
    const pool = await sql.connect(dbConfig);
    console.log('Conectado a MSSQL');
    return pool;
  } catch (error) {
    console.error('Error de conexión MSSQL:', error);
    return null;
  }
}

// queryDb para MSSQL
async function queryDb(query, params = []) {
  const pool = await connectDb();
  if (!pool) return null;

  try {
    const request = pool.request();
    params.forEach((param, i) => {
      // SQL Server usa parámetros nombrados @p1, @p2 ...
      request.input(`p${i + 1}`, param);
    });
    // Reemplazar ? por @p1, @p2 ...
    const namedQuery = query.replace(/\?/g, (_, i) => `@p${i + 1}`);
    const result = await request.query(namedQuery);
    return result.recordset;
  } catch (error) {
    console.error('Error en consulta MSSQL:', error);
    return null;
  } finally {
    await pool.close();
    console.log('Conexión MSSQL cerrada');
  }
}

// Ejemplo funciones
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
