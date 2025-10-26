// 📁 Controller/controllers/notificacion.controller.js
const NotificacionModel = require('../../Model/Notificacion.model');
const UsuarioModel = require('../../Model/Usuario.model'); // Para buscar el distrito del usuario

exports.getNotificaciones = async (req, res) => {
    try {
        const usuarioID = req.userId;
        const filter = req.query.filter || 'todas'; // 'todas', 'alertas', 'mensajes'
        
        const notificaciones = await NotificacionModel.getNotifications(usuarioID, filter);
        
        res.status(200).json({
            status: 'success',
            data: notificaciones
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'error',
            message: 'Error al obtener notificaciones.'
        });
    }
};

exports.marcarComoLeida = async (req, res) => {
    try {
        const usuarioID = req.userId;
        const notificacionID = req.params.id;

        const success = await NotificacionModel.markAsRead(notificacionID, usuarioID);

        if (success) {
            res.status(200).json({ status: 'success', message: 'Notificación marcada como leída.' });
        } else {
            res.status(404).json({ status: 'error', message: 'Notificación no encontrada o no pertenece al usuario.' });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'error',
            message: 'Error al actualizar la notificación.'
        });
    }
};

exports.getAlertaMercadoActiva = async (req, res) => {
    try {
        const usuarioID = req.userId;
        
        // 1. Buscar el perfil del usuario para saber su distrito
        const usuario = await UsuarioModel.findById(usuarioID);
        if (!usuario || !usuario.Distrito) {
            return res.status(200).json({ status: 'success', data: null, message: 'Usuario no tiene distrito configurado.' });
        }

        // 2. Buscar alertas para ese distrito
        const alerta = await NotificacionModel.getActiveMarketAlert(usuario.Distrito);
        
        res.status(200).json({
            status: 'success',
            data: alerta
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'error',
            message: 'Error al obtener alertas de mercado.'
        });
    }
};