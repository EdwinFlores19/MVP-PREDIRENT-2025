// 📁 Controller/controllers/auth.controller.js
const UsuarioModel = require('../../Model/Usuario.model');
const jwt = require('jsonwebtoken');
const { validationResult } = require('../middleware/validators.middleware'); // Importar desde nuestro validador

exports.register = async (req, res) => {
    // 1. Validar los datos de entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ status: 'error', errors: errors.array() });
    }

    const { nombreCompleto, email, password } = req.body;

    try {
        // 2. Llamar al Modelo para crear el usuario
        const newUser = await UsuarioModel.create({ nombreCompleto, email, password });
        
        // 3. Enviar respuesta exitosa
        res.status(201).json({
            status: 'success',
            message: 'Usuario registrado exitosamente.',
            data: newUser
        });

    } catch (error) {
        // 4. Manejar errores (ej. email duplicado)
        res.status(409).json({
            status: 'error',
            message: error.message || 'Error al registrar el usuario.'
        });
    }
};

exports.login = async (req, res) => {
    // 1. Validar los datos de entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ status: 'error', errors: errors.array() });
    }
    
    const { email, password } = req.body;

    try {
        // 2. Buscar al usuario por email
        const user = await UsuarioModel.findByEmail(email);
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'Credenciales incorrectas (usuario no encontrado).'
            });
        }

        // 3. Comparar la contraseña
        const isMatch = await UsuarioModel.comparePassword(password, user.PasswordHash);
        if (!isMatch) {
            return res.status(401).json({
                status: 'error',
                message: 'Credenciales incorrectas (contraseña no coincide).'
            });
        }

        // 4. Crear el JSON Web Token (JWT)
        const payload = {
            id: user.UsuarioID,
            email: user.Email,
            nombre: user.NombreCompleto
        };

        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '24h' } // El token expira en 24 horas
        );

        // 5. Enviar respuesta exitosa con el token
        res.status(200).json({
            status: 'success',
            message: 'Inicio de sesión exitoso.',
            data: {
                token: token,
                user: {
                    id: user.UsuarioID,
                    nombre: user.NombreCompleto,
                    email: user.Email
                }
            }
        });

    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message || 'Error en el servidor durante el login.'
        });
    }
};