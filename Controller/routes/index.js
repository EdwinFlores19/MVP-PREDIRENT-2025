/*
 * Controller/routes/index.js
 * Enrutador principal. Carga y organiza todos los endpoints de la API.
 */

const express = require('express');
const router = express.Router();
const { poolPromise } = require('../../Model/dbConnection'); // 🔗 Importar conexión a BD

// Importar los enrutadores de cada módulo
const authRoutes = require('./auth.routes');
const propiedadRoutes = require('./propiedad.routes');
const comunidadRoutes = require('./comunidad.routes');
const notificacionRoutes = require('./notificacion.routes');
const estimadorRoutes = require('./estimador.routes');
const reporteRoutes = require('./reporte.routes');

// Montar cada enrutador en su ruta base
router.use('/auth', authRoutes);
router.use('/propiedades', propiedadRoutes);
router.use('/comunidad', comunidadRoutes);
router.use('/notificaciones', notificacionRoutes);
router.use('/estimador', estimadorRoutes);
router.use('/reportes', reporteRoutes);

// =====================================================
// ✅ Ruta de prueba de estado general del API
// =====================================================
router.get('/status', (req, res) => {
  res.status(200).json({
    status: 'online',
    message: 'API de PrediRent está operativa.'
  });
});

// =====================================================
// ✅ Ruta de prueba de conexión a SQL Server
// =====================================================
router.get('/testDB', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .query('SELECT TOP 5 name, database_id FROM sys.databases ORDER BY database_id');
    
    res.json({
      ok: true,
      message: 'Conexión a SQL Server exitosa 🚀',
      databases: result.recordset
    });
  } catch (err) {
    console.error('Error en /testDB:', err);
    res.status(500).json({
      ok: false,
      message: 'Error al conectarse a la base de datos',
      error: err.message
    });
  }
});

module.exports = router;
