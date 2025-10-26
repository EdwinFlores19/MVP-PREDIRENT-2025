// 📁 Controller/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { validateRegistration, validateLogin } = require('../middleware/validators.middleware');

// Ruta para el registro (Vista: 2-registro.html)
// 'validateRegistration' es un middleware que valida los campos
router.post('/register', validateRegistration, authController.register);

// Ruta para el inicio de sesión (Vista: 1-login.html)
router.post('/login', validateLogin, authController.login);

module.exports = router;