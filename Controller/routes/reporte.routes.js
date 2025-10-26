// 📁 Controller/routes/reporte.routes.js
const express = require('express');
const router = express.Router();
const repController = require('../controllers/reporte.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { validateReportGeneration } = require('../middleware/validators.middleware');

// Proteger todas las rutas
router.use(verifyToken);

// POST /api/reportes/generar
// (Vista: 5-generar-reportes.html)
router.post('/generar', validateReportGeneration, repController.generarReporte);

module.exports = router;