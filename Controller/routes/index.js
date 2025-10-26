/*
 * Controller/routes/index.js
 * Enrutador principal. Carga y organiza todos los endpoints de la API.
 */
const express = require('express');
const router = express.Router();

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

// Ruta de prueba para la API
router.get('/status', (req, res) => {
    res.status(200).json({
        status: 'online',
        message: 'API de PrediRent está operativa.'
    });
});

module.exports = router;