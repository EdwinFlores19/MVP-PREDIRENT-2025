// 📁 Controller/middleware/validators.middleware.js
// (Necesitamos crear este archivo para las validaciones)
const { body, query, validationResult } = require('express-validator');

// Validación para POST /api/auth/register
exports.validateRegistration = [
    body('nombreCompleto', 'El nombre es obligatorio y debe tener al menos 3 caracteres.')
        .trim()
        .isLength({ min: 3 }),
    
    body('email', 'Por favor, incluye un email válido.')
        .isEmail()
        .normalizeEmail(),
    
    body('password', 'La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un símbolo.')
        .isStrongPassword({
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
        })
];

// Validación para POST /api/auth/login
exports.validateLogin = [
    body('email', 'Por favor, incluye un email válido.')
        .isEmail()
        .normalizeEmail(),
    
    body('password', 'La contraseña no puede estar vacía.')
        .notEmpty()
];

// Validación para POST /api/reportes/generar
exports.validateReportGeneration = [
    body('propiedadID', 'Se requiere un ID de propiedad.').isInt({ gt: 0 }),
    body('mes', 'El mes es obligatorio (1-12).').isInt({ min: 1, max: 12 }),
    body('anio', 'El año es obligatorio (ej. 2025).').isInt({ min: 2020, max: 2030 }),
    body('tiposContenido', 'Debe ser un array de tipos de contenido.').isArray({ min: 1 })
];

// Función para exportar los resultados de la validación (usada en los controllers)
exports.validationResult = validationResult;