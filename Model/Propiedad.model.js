const { sql, poolPromise } = require('./dbConnection');
const fetch = require('node-fetch');

class PropiedadModel {

    static async create(propertyData, usuarioID) {
        // ... (código de creación ya corregido)
    }

    static async getPropertiesByUserId(usuarioID) {
        console.log(`Ejecutando getPropertiesByUserId para UsuarioID: ${usuarioID}`);
        try {
            const pool = await poolPromise;
            const request = pool.request();
            request.input('UsuarioID', sql.Int, usuarioID);

            const query = `SELECT PropiedadID, Titulo, TipoPropiedad, Distrito, EstadoPropiedad, Metraje, NumHabitaciones, NumBanos, NumHuespedes, NumCamas FROM dbo.Propiedades WHERE UsuarioID = @UsuarioID ORDER BY FechaRegistro DESC`;
            console.log('SQL Query:', query);

            const result = await request.query(query);
            return result.recordset;
        } catch (error) {
            console.error('--- ERROR DE BASE DE DATOS EN getPropertiesByUserId ---');
            console.error('Mensaje:', error.message);
            if (error.originalError) {
                console.error('Error Original de SQL Server:', error.originalError.message);
            }
            throw new Error('Error al obtener las propiedades del usuario desde la base de datos.');
        }
    }

    static async getActiveCountByUserId(usuarioID) {
        console.log(`Ejecutando getActiveCountByUserId para UsuarioID: ${usuarioID}`);
        try {
            const pool = await poolPromise;
            const request = pool.request();
            request.input('UsuarioID', sql.Int, usuarioID);
            
            const query = `SELECT COUNT(*) AS Total FROM dbo.Propiedades WHERE UsuarioID = @UsuarioID AND UPPER(EstadoPropiedad) = 'ACTIVA'`;
            console.log('SQL Query:', query);

            const result = await request.query(query);
            return result.recordset[0].Total;
        } catch (error) {
            console.error('--- ERROR DE BASE DE DATOS EN getActiveCountByUserId ---');
            console.error('Mensaje:', error.message);
            if (error.originalError) {
                console.error('Error Original de SQL Server:', error.originalError.message);
            }
            throw new Error('Error al contar las propiedades activas.');
        }
    }
}

module.exports = PropiedadModel;
