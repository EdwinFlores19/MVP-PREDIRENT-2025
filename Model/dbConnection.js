// Model/dbConnection.js
const util = require('util');
const sql = require('mssql'); // usa tedious (JS) por defecto para conexión TCP
require('dotenv').config();

const DB_SERVER = process.env.DB_SERVER || '127.0.0.1';
const DB_PORT = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined;
const DB_DATABASE = process.env.DB_DATABASE || 'PrediRentDB';
const DB_USER = process.env.DB_USER || undefined;
const DB_PASSWORD = process.env.DB_PASSWORD || undefined;

function dumpErr(err, prefix = '') {
  console.error(prefix + '--- ERROR RAW ---');
  try {
    console.error(util.inspect(err, { depth: null, colors: true }));
  } catch (e) {
    console.error(prefix + 'No se pudo inspeccionar el error:', e);
    console.error(prefix, err);
  }
  if (err && err.message) console.error(prefix + 'Message:', err.message);
  if (err && err.code) console.error(prefix + 'Code:', err.code);
  if (err && err.stack) console.error(prefix + 'Stack:', err.stack);
  if (err && err.originalError) {
    console.error(prefix + 'OriginalError:', util.inspect(err.originalError, { depth: null }));
  }
}

if (!DB_PORT) {
  console.warn('⚠️ DB_PORT no definido en .env — recomendamos definir DB_PORT para instancia SQLEXPRESS (ej: 58675)');
}

// Construir configuración para TCP + SQL Auth
const dbConfig = {
  server: DB_SERVER,
  port: DB_PORT,
  database: DB_DATABASE,
  user: DB_USER,
  password: DB_PASSWORD,
  options: {
    encrypt: process.env.DB_OPTIONS_ENCRYPT === 'true', // false para local
    trustServerCertificate: process.env.DB_OPTIONS_TRUSTSERVERCERTIFICATE === 'true'
  },
  // timeouts razonables
  connectionTimeout: 15000,
  requestTimeout: 300000
};

console.log('--- Intento de conexión SQL (TCP) ---');
console.log({
  server: dbConfig.server,
  port: dbConfig.port,
  database: dbConfig.database,
  user: dbConfig.user ? '***' : undefined
});
console.log('Usuario proceso Node:', process.env.USERDOMAIN + '\\' + process.env.USERNAME);
console.log('------------------------------------');

const poolPromise = new sql.ConnectionPool(dbConfig)
  .connect()
  .then(pool => {
    console.log(`✅ Conectado a SQL Server ${dbConfig.server}:${dbConfig.port} - DB: ${dbConfig.database}`);
    return pool;
  })
  .catch(err => {
    console.error('❌ Error al conectar con SQL Server (TCP using SQL Auth). Voy a detallar:');
    dumpErr(err, '[TCP SQLAuth] ');
    // sugerencias útiles
    if (!DB_USER || !DB_PASSWORD) {
      console.error('→ Nota: DB_USER o DB_PASSWORD no están definidos. Necesitas credenciales SQL si usas TCP/puerto.');
    }
    console.error('→ Verifica que el puerto sea correcto (netstat -ano | findstr LISTENING | findstr <PID>)');
    console.error('→ Verifica que el login SQL exista y tenga permisos en la DB (usa SSMS).');
    process.exit(1);
  });

module.exports = { sql, poolPromise };
