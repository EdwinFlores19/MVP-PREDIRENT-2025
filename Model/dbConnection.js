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
    // --- CAMBIOS BASADOS EN TU IMAGEN ---

    // 1. El 'Server Name' de tu imagen.
    //    Usamos doble barra '\\' para escapar el carácter '\' en un string de JS.
    server: process.env.DB_SERVER || '(localdb)\\MSSQLLocalDB',
    
    // 2. El nombre de tu base de datos. Mantenemos 'PrediRentDB' como en tu SQL.
    database: process.env.DB_DATABASE || 'PrediRentDB',

    // 3. 'user' y 'password' se eliminan porque usas Autenticación de Windows.
    
    options: {
        // 4. Esto le indica a 'mssql' que use la Autenticación de Windows.
        //    (Coincide con tu selección "Windows Authentication")
        trustedConnection: true,

        // 5. Esto coincide con tu selección "Encrypt: Mandatory"
        encrypt: true,
        
        // 6. Esto coincide con tu selección "Trust Server Certificate" (marcado)
        trustServerCertificate: true
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
        console.error('Verifica que el nombre del servidor sea correcto: (localdb)\\MSSQLLocalDB');
        // Salir del proceso si no se puede conectar a la BD
        process.exit(1); 
    });

module.exports = {
    sql,
    poolPromise
};