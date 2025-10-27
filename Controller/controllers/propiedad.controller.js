const PropiedadModel = require('../../Model/Propiedad.model');

// Función auxiliar para convertir valores a enteros de forma segura
const safeInt = (value, defaultValue = 0) => {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
};

exports.crearPropiedad = async (req, res) => {
    try {
        const usuarioID = req.userId;
        const rawData = req.body;

        // Sanitizar y normalizar los datos antes de pasarlos al modelo
        const propertyData = {
            ...rawData,
            huespedes: safeInt(rawData.huespedes, 1),
            habitaciones: safeInt(rawData.habitaciones, 1),
            camas: safeInt(rawData.camas, 1),
            baños: safeInt(rawData.baños, 1),
            titulo: rawData.titulo || '', // Asegurar que no sea null
            descripcion: rawData.descripcion || '',
            // Asegurar que los arrays existan
            comodidades: rawData.comodidades || [],
            comodidadesDestacadas: rawData.comodidadesDestacadas || [],
            seguridad: rawData.seguridad || [],
            aspectos: rawData.aspectos || []
        };

        console.log('Enviando estos datos al modelo:', propertyData);

        const newPropiedad = await PropiedadModel.create(propertyData, usuarioID);

        res.status(201).json({
            status: 'success',
            message: 'Propiedad registrada exitosamente.',
            data: newPropiedad
        });

    } catch (error) {
        console.error('Error capturado en propiedad.controller.js:', error.message);
        res.status(500).json({
            status: 'error',
            message: error.message || 'Error al registrar la propiedad. La transacción fue revertida.'
        });
    }
};

exports.getMisPropiedades = async (req, res) => {
    try {
        const usuarioID = req.userId;
        const propiedades = await PropiedadModel.getPropertiesByUserId(usuarioID);
        
        const dashboardData = {
            totalPropiedades: propiedades.length,
            ingresosMes: propiedades.reduce((acc, p) => acc + (p.IngresoMesActual || 0), 0),
            tasaOcupacion: propiedades.length > 0 ? 85 : 0, 
            comparativoMesAnterior: 12, 
            propiedades: propiedades
        };

        res.status(200).json(dashboardData);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'error',
            message: 'Error al obtener las propiedades.'
        });
    }
};