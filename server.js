/*
 * server.js
 * Punto de entrada principal de la API de PrediRent.
 * Configura Express, carga middleware y monta las rutas.
 */

// Carga las variables de entorno desde .env
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { poolPromise } = require('./Model/dbConnection'); // Importar para forzar la conexión al inicio

// Importar el enrutador principal
const mainRouter = require('./Controller/routes/index');

// Inicializar la aplicación Express
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT GETDATE() AS now');
    res.json({ ok: true, now: result.recordset[0].now });
  } catch (err) {
    console.error('Error en route / :', err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});
// === Configuración de Middleware ===

// 1. CORS (Cross-Origin Resource Sharing)
// Permite que tu frontend (Vistas) llame a esta API
app.use(cors());

// 2. Body Parsers
// Permite al servidor leer JSON del body de las peticiones
app.use(express.json());
// Permite al servidor leer datos de formularios tradicionales
app.use(express.urlencoded({ extended: true }));

// === Montaje de Rutas ===

// Monta todas las rutas de la API bajo el prefijo '/api'
app.use('/api', mainRouter);
app.use('/api/estimador', require('./Controller/routes/estimador.routes'));

// === Manejo de Errores Global ===
// Un middleware simple para capturar errores no manejados
app.use((err, req, res, next) => {
    console.error('Error no controlado:', err.stack);
    res.status(500).send({
        status: 'error',
        message: 'Algo salió mal en el servidor.'
    });
});

// === Iniciar el Servidor ===
app.listen(PORT, () => {
    console.log(`Servidor de PrediRent escuchando en http://localhost:${PORT}`);
    // Verificamos que la conexión a la BD esté activa al arrancar
    poolPromise.then(pool => {
        if (pool.connected) {
            console.log('Pool de conexión a la BD verificado y listo.');
        }
    }).catch(err => {
        console.error('No se pudo verificar el pool de la BD al arrancar.', err);
    });
});