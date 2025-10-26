// 📁 Controller/controllers/comunidad.controller.js
const ComunidadModel = require('../../Model/Comunidad.model');

exports.getMiembros = async (req, res) => {
    try {
        // Los filtros vienen en req.query (ej. /miembros?search=Edwin&distrito=Surco)
        const filters = req.query;

        const miembros = await ComunidadModel.getCommunityMembers(filters);
        
        res.status(200).json({
            status: 'success',
            data: miembros
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'error',
            message: 'Error al obtener miembros de la comunidad.'
        });
    }
};

exports.enviarMensaje = async (req, res) => {
    try {
        const remitenteID = req.userId; // Usuario autenticado
        const { destinatarioID, contenido } = req.body;

        if (!destinatarioID || !contenido) {
            return res.status(400).json({
                status: 'error',
                message: 'Faltan destinatarioID o contenido.'
            });
        }
        
        const mensajeEnviado = await ComunidadModel.sendMessage(remitenteID, destinatarioID, contenido);

        res.status(201).json({
            status: 'success',
            message: 'Mensaje enviado.',
            data: mensajeEnviado
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'error',
            message: 'Error al enviar el mensaje.'
        });
    }
};