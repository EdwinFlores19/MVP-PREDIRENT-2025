/*
 * auth.middleware.js
 * Middleware para verificar el JSON Web Token (JWT) en rutas protegidas.
 */
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    // Obtener el token del header 'Authorization'
    const authHeader = req.headers['authorization'];
    
    // El formato es "Bearer TOKEN"
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(403).send({
            status: 'error',
            message: 'No se proporcionó un token de autenticación.'
        });
    }

    try {
        // Verificar el token usando la clave secreta
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Añadir el ID del usuario (extraído del token) al objeto 'req'
        // para que las siguientes funciones del controlador puedan usarlo.
        req.userId = decoded.id;
        
        // Continuar con la siguiente función (el controlador)
        next();
    } catch (error) {
        console.error('Error de token:', error.message);
        return res.status(401).send({
            status: 'error',
            message: 'Token inválido o expirado. Por favor, inicia sesión de nuevo.'
        });
    }
};

module.exports = { verifyToken };