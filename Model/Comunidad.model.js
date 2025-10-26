/*
 * Comunidad.model.js
 * Modelo para la gestión de la comunidad de propietarios y mensajería.
 */

const { sql, poolPromise } = require('./dbConnection');

class ComunidadModel {

    /**
     * Obtiene miembros de la comunidad con filtros dinámicos.
     * @param {object} filters - Objeto de filtros.
     * @param {string} [filters.search] - Término de búsqueda (nombre o distrito).
     * @param {string} [filters.distrito] - Distrito específico.
     * @param {number} [filters.interes] - ID del interés.
     * @param {string} [filters.quick] - Filtro rápido ('verificados', 'activos').
     * @returns {Promise<Array<object>>} Lista de miembros de la comunidad.
     */
    static async getCommunityMembers(filters = {}) {
        try {
            const pool = await poolPromise;
            const request = pool.request();

            // Construcción de consulta base
            let query = `
                SELECT 
                    U.UsuarioID, 
                    U.NombreCompleto, 
                    U.Distrito, 
                    U.EsVerificado, 
                    U.UltimaConexion,
                    (SELECT COUNT(P.PropiedadID) FROM dbo.Propiedades P WHERE P.UsuarioID = U.UsuarioID AND P.EstadoPropiedad = 'Activa') AS PropiedadCount,
                    STRING_AGG(I.Nombre, ', ') WITHIN GROUP (ORDER BY I.Nombre) AS Intereses
                FROM dbo.Usuarios U
                LEFT JOIN dbo.UsuarioIntereses UI ON U.UsuarioID = UI.UsuarioID
                LEFT JOIN dbo.Intereses I ON UI.InteresID = I.InteresID
            `;
            
            let whereClauses = [];

            // Aplicar filtros
            if (filters.search) {
                whereClauses.push('(U.NombreCompleto LIKE @Search OR U.Distrito LIKE @Search)');
                request.input('Search', sql.NVarChar(255), `%${filters.search}%`);
            }
            
            if (filters.distrito) {
                whereClauses.push('U.Distrito = @Distrito');
                request.input('Distrito', sql.NVarChar(100), filters.distrito);
            }

            if (filters.interes) {
                // El JOIN ya está, solo necesitamos filtrar
                whereClauses.push('UI.InteresID = @InteresID');
                request.input('InteresID', sql.Int, filters.interes);
            }

            if (filters.quick === 'verificados') {
                whereClauses.push('U.EsVerificado = 1');
            }

            if (filters.quick === 'activos') {
                // Asumimos "activos" si la última conexión fue en los últimos 30 min
                whereClauses.push('U.UltimaConexion >= DATEADD(minute, -30, GETDATE())');
            }

            if (whereClauses.length > 0) {
                query += ' WHERE ' + whereClauses.join(' AND ');
            }

            query += `
                GROUP BY U.UsuarioID, U.NombreCompleto, U.Distrito, U.EsVerificado, U.UltimaConexion
                ORDER BY U.NombreCompleto
            `;
            
            const result = await request.query(query);
            return result.recordset;

        } catch (error) {
            console.error('Error en ComunidadModel.getCommunityMembers:', error.message);
            throw new Error('Error al obtener miembros de la comunidad.');
        }
    }

    /**
     * Envía un mensaje privado de un usuario a otro.
     * @param {number} remitenteID - ID del usuario que envía.
     * @param {number} destinatarioID - ID del usuario que recibe.
     * @param {string} contenido - El texto del mensaje.
     * @returns {Promise<object>} El mensaje guardado.
     */
    static async sendMessage(remitenteID, destinatarioID, contenido) {
        try {
            const pool = await poolPromise;
            const request = pool.request();

            request.input('RemitenteID', sql.Int, remitenteID);
            request.input('DestinatarioID', sql.Int, destinatarioID);
            request.input('Contenido', sql.NVarChar(2000), contenido);

            const result = await request.query(
                `INSERT INTO dbo.MensajesPrivados (RemitenteID, DestinatarioID, Contenido)
                 OUTPUT INSERTED.MensajeID, INSERTED.FechaEnvio
                 VALUES (@RemitenteID, @DestinatarioID, @Contenido)`
            );
            
            // Aquí también se debería crear una Notificación tipo 'Mensaje'
            // (Se omite por brevedad, pero iría aquí)
            
            return result.recordset[0];

        } catch (error) {
            console.error('Error en ComunidadModel.sendMessage:', error.message);
            throw new Error('Error al enviar el mensaje.');
        }
    }
}

module.exports = ComunidadModel;