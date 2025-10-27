// 📁 Controller/routes/propiedad.routes.js
const express = require('express');
const router = express.Router();
const propController = require('../controllers/propiedad.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Proteger todas las rutas de este módulo con el middleware de autenticación
router.use(verifyToken);

// POST /api/propiedades
// (Vista: 4-registrar-propiedad.html)
router.post('/', propController.crearPropiedad);

// GET /api/propiedades/mis-propiedades
// (Vista: 3-menu-principal.html)
router.get('/mis-propiedades', propController.getMisPropiedades);

// GET /api/propiedades/activas/count
// (Vista: 3-menu-principal.html)
router.get('/activas/count', propController.contarPropiedadesActivas);

module.exports = router;