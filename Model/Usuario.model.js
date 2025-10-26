/*
 * Usuario.model.js
 * Modelo para la gestión de usuarios, autenticación y perfiles.
 */

const { sql, poolPromise } = require('./dbConnection');
const bcrypt = require('bcryptjs'); // Necesitarás 'npm install bcryptjs'

class UsuarioModel {

    /**
     * Busca un usuario por su dirección de email.
     * @param {string} email - El email del usuario a buscar.
     * @returns {Promise<object|null>} El objeto de usuario completo (incluyendo hash) o null si no se encuentra.
     */
    static async findByEmail(email) {
        try {
            const pool = await poolPromise;
            const request = pool.request();
            
            request.input('Email', sql.NVarChar(255), email);
            
            const result = await request.query(
                'SELECT * FROM dbo.Usuarios WHERE Email = @Email'
            );
            
            return result.recordset[0] || null;

        } catch (error) {
            console.error('Error en UsuarioModel.findByEmail:', error.message);
            throw new Error('Error al buscar usuario por email.');
        }
    }

    /**
     * Busca un usuario por su ID, omitiendo datos sensibles.
     * @param {number} usuarioID - El ID del usuario.
     * @returns {Promise<object|null>} El objeto de usuario (sin hash) o null.
     */
    static async findById(usuarioID) {
        try {
            const pool = await poolPromise;
            const request = pool.request();

            request.input('UsuarioID', sql.Int, usuarioID);

            const result = await request.query(
                'SELECT UsuarioID, NombreCompleto, Email, Distrito, AvatarURL, EsVerificado, UltimaConexion, FechaRegistro FROM dbo.Usuarios WHERE UsuarioID = @UsuarioID'
            );
            
            return result.recordset[0] || null;

        } catch (error) {
            console.error('Error en UsuarioModel.findById:', error.message);
            throw new Error('Error al buscar usuario por ID.');
        }
    }

    /**
     * Crea un nuevo usuario en la base de datos.
     * @param {object} userData - Datos del nuevo usuario.
     * @param {string} userData.nombreCompleto - Nombre del usuario.
     * @param {string} userData.email - Email del usuario.
     * @param {string} userData.password - Contraseña en texto plano.
     * @returns {Promise<object>} El objeto del usuario recién creado (sin hash).
     */
    static async create(userData) {
        const { nombreCompleto, email, password } = userData;
        
        try {
            // Hashear la contraseña
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(password, salt);

            const pool = await poolPromise;
            const request = pool.request();

            request.input('NombreCompleto', sql.NVarChar(255), nombreCompleto);
            request.input('Email', sql.NVarChar(255), email);
            request.input('PasswordHash', sql.NVarChar(sql.MAX), passwordHash);
            
            // Usamos 'OUTPUT INSERTED.*' para obtener el registro recién creado
            const result = await request.query(
                `INSERT INTO dbo.Usuarios (NombreCompleto, Email, PasswordHash, EstadoUsuario)
                 OUTPUT INSERTED.UsuarioID, INSERTED.NombreCompleto, INSERTED.Email, INSERTED.FechaRegistro, INSERTED.EsVerificado
                 VALUES (@NombreCompleto, @Email, @PasswordHash, 'Activo')`
            );
            
            return result.recordset[0];

        } catch (error) {
            console.error('Error en UsuarioModel.create:', error.message);
            // Manejo de error de email duplicado (Constraint UQ_Usuarios_Email)
            if (error.number === 2627 || error.number === 2601) {
                throw new Error('El correo electrónico ya está registrado.');
            }
            throw new Error('Error al crear el usuario.');
        }
    }

    /**
     * Compara una contraseña candidata con el hash almacenado.
     * @param {string} candidatePassword - Contraseña en texto plano.
     * @param {string} hash - El hash de la base de datos.
     * @returns {Promise<boolean>} True si las contraseñas coinciden.
     */
    static async comparePassword(candidatePassword, hash) {
        return bcrypt.compare(candidatePassword, hash);
    }
}

module.exports = UsuarioModel;