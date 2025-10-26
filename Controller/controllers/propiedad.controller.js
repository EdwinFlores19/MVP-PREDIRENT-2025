// 📁 Controller/controllers/propiedad.controller.js
const PropiedadModel = require('../../Model/Propiedad.model');

exports.crearPropiedad = async (req, res) => {
    try {
        // req.userId es inyectado por el middleware verifyToken
        const usuarioID = req.userId;
        
        // req.body contiene todos los datos del formulario de 5 pasos
        const propertyData = req.body; 

        // Llamar al Modelo para ejecutar la transacción
        const newPropiedad = await PropiedadModel.create(propertyData, usuarioID);

        res.status(201).json({
            status: 'success',
            message: 'Propiedad registrada exitosamente.',
            data: newPropiedad
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'error',
            message: 'Error al registrar la propiedad. La transacción fue revertida.'
        });
    }
};

exports.getMisPropiedades = async (req, res) => {
    try {
        const usuarioID = req.userId;
        
        const propiedades = await PropiedadModel.getPropertiesByUserId(usuarioID);

        res.status(200).json({
            status: 'success',
            data: propiedades
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'error',
            message: 'Error al obtener las propiedades.'
        });
    }
};