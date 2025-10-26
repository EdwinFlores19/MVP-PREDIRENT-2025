// 📁 Controller/routes/estimador.routes.js
const express = require('express');
const router = express.Router();
const estController = require('../controllers/estimador.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Proteger todas las rutas
router.use(verifyToken);

// POST /api/estimador/calcular
// (Vista: 9-estimar-precio.html)
router.post('/calcular', estController.calcularPrecio);

// GET /api/estimador/comparacion
// (Vista: 9-estimar-precio.html)
router.get('/comparacion', estController.getComparacionMercado);

module.exports = router;