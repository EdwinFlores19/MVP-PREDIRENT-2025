// 📁 Controller/routes/comunidad.routes.js
const express = require('express');
const router = express.Router();
const comController = require('../controllers/comunidad.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Proteger todas las rutas
router.use(verifyToken);

// GET /api/comunidad/miembros
// (Vistas: 6-contacto-arrendadores.html, 8-comunidad-propietarios.html)
router.get('/miembros', comController.getMiembros);

// POST /api/comunidad/mensaje
// (Vistas: 6-contacto-arrendadores.html, 8-comunidad-propietarios.html)
router.post('/mensaje', comController.enviarMensaje);

module.exports = router;