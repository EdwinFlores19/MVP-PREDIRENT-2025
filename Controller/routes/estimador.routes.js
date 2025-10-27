const express = require('express');
const router = express.Router();
const estimadorController = require('../controllers/estimador.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Proteger la ruta de predicción
router.post('/prediccion', verifyToken, estimadorController.predecirPrecio);

module.exports = router;
