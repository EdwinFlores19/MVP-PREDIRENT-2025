/*
 * Notificacion.model.js
 * Modelo para la gestión de notificaciones y alertas de mercado.
 */

const { sql, poolPromise } = require('./dbConnection');

class NotificacionModel {

    /**
     * Obtiene las notificaciones para un usuario, con filtros.
     * @param {number} usuarioID - El ID del usuario.
     * @param {string} [filter='todas'] - 'todas', 'alertas', 'mensajes'.
     * @returns {Promise<Array<object>>} Lista de notificaciones.
     */
    static async getNotifications(usuarioID, filter = 'todas') {
        try {
            const pool = await poolPromise;
            const request = pool.request();
            
            request.input('UsuarioID', sql.Int, usuarioID);

            let query = 'SELECT * FROM dbo.Notificaciones WHERE UsuarioID = @UsuarioID';

            if (filter === 'alertas') {
                query += " AND TipoNotificacion IN ('Alerta', 'Oportunidad')";
            } else if (filter === 'mensajes') {
                query += " AND TipoNotificacion = 'Mensaje'";
            }

            query += ' ORDER BY FechaCreacion DESC';

            const result = await request.query(query);
            return result.recordset;

        } catch (error) {
            console.error('Error en NotificacionModel.getNotifications:', error.message);
            throw new Error('Error al obtener notificaciones.');
        }
    }

    /**
     * Obtiene la alerta de mercado activa más reciente para un distrito.
     * @param {string} distrito - El distrito a consultar.
     * @returns {Promise<object|null>} La alerta activa o null.
     */
    static async getActiveMarketAlert(distrito) {
        try {
            const pool = await poolPromise;
            const request = pool.request();
            
            request.input('Distrito', sql.NVarChar(100), distrito);

            const result = await request.query(
                `SELECT TOP 1 * FROM dbo.AlertasMercado 
                 WHERE Distrito = @Distrito AND GETDATE() BETWEEN FechaInicio AND FechaFin
                 ORDER BY FechaInicio DESC`
            );
            
            return result.recordset[0] || null;

        } catch (error) {
            console.error('Error en NotificacionModel.getActiveMarketAlert:', error.message);
            throw new Error('Error al obtener alerta de mercado.');
        }
    }

    /**
     * Marca una notificación como leída.
     * @param {number} notificacionID - El ID de la notificación.
     * @param {number} usuarioID - El ID del usuario (para seguridad).
     * @returns {Promise<boolean>} True si fue exitoso.
     */
    static async markAsRead(notificacionID, usuarioID) {
        try {
            const pool = await poolPromise;
            const request = pool.request();

            request.input('NotificacionID', sql.Int, notificacionID);
            request.input('UsuarioID', sql.Int, usuarioID);

            const result = await request.query(
                'UPDATE dbo.Notificaciones SET Leido = 1 WHERE NotificacionID = @NotificacionID AND UsuarioID = @UsuarioID'
            );
            
            return result.rowsAffected[0] > 0;

        } catch (error) {
            console.error('Error en NotificacionModel.markAsRead:', error.message);
            throw new Error('Error al marcar notificación como leída.');
        }
    }
}

module.exports = NotificacionModel;