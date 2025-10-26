// 📁 Controller/routes/notificacion.routes.js
const express = require('express');
const router = express.Router();
const notifController = require('../controllers/notificacion.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Proteger todas las rutas
router.use(verifyToken);

// GET /api/notificaciones
// (Vista: 7-notificaciones.html)
router.get('/', notifController.getNotificaciones);

// PATCH /api/notificaciones/:id/leer
// (Para marcar una como leída)
router.patch('/:id/leer', notifController.marcarComoLeida);

// GET /api/notificaciones/alertas-mercado
// (Vista: 7-notificaciones.html - Popup)
router.get('/alertas-mercado', notifController.getAlertaMercadoActiva);

module.exports = router;