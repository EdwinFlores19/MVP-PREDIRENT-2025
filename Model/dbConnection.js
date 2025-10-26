/*
 * dbConnection.js
 * Configura y exporta el pool de conexiones de SQL Server (mssql).
 * Los demás modelos importarán 'poolPromise' para ejecutar consultas.
 */

const sql = require('mssql');

// --- IMPORTANTE ---
// Mueve esta configuración a variables de entorno (.env) en un proyecto real.
// NUNCA dejes credenciales hardcodeadas en el código fuente.

const dbConfig = {
    // --- Volvemos al nombre original para LocalDB ---
    server: process.env.DB_SERVER || '(localdb)\\MSSQLLocalDB', // Nombre original

    database: process.env.DB_DATABASE || 'PrediRentDB',

    // 'user' y 'password' se eliminan porque usas Autenticación de Windows.

    options: {
        // Esto le indica a 'mssql' que use la Autenticación de Windows.
        trustedConnection: true,

        // Esto coincide con tu selección "Encrypt: Mandatory"
        encrypt: true,

        // Esto coincide con tu selección "Trust Server Certificate" (marcado)
        trustServerCertificate: true

        // Quitamos el 'port' por ahora, ya que LocalDB podría no usar TCP/IP por defecto.
    }
};

/**
 * Promesa que representa el pool de conexiones.
 * Los modelos deben hacer 'await poolPromise' para obtener una conexión.
 */
const poolPromise = new sql.ConnectionPool(dbConfig)
    .connect()
    .then(pool => {
        console.log('Conectado a SQL Server (PrediRentDB) con Autenticación de Windows');
        return pool;
    })
    .catch(err => {
        console.error('Error al conectar a la base de datos: ', err);
        console.error('---');
        console.error('Verifica que SQL Server (LocalDB) esté ejecutándose.');
        console.error('Verifica que el nombre del servidor en .env y dbConnection.js sea exactamente: (localdb)\\\\MSSQLLocalDB');
        // Salir del proceso si no se puede conectar a la BD
        process.exit(1);
    });

module.exports = {
    sql,
    poolPromise
};