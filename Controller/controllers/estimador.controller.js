// 📁 Controller/controllers/estimador.controller.js
const EstimadorModel = require('../../Model/Estimador.model');

exports.calcularPrecio = (req, res) => {
    try {
        // req.body debe contener el objeto de la propiedad
        // { location, metrage, bedrooms, bathrooms, amenities, highlights, security }
        const propertyFeatures = req.body;
        
        const precioEstimado = EstimadorModel.calculatePrice(propertyFeatures);

        res.status(200).json({
            status: 'success',
            data: {
                precioEstimado: precioEstimado,
                rangoMin: Math.round(precioEstimado * 0.85),
                rangoMax: Math.round(precioEstimado * 1.15)
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'error',
            message: 'Error al calcular el precio.'
        });
    }
};

exports.getComparacionMercado = async (req, res) => {
    try {
        // Los datos llegan por query: /comparacion?distrito=Miraflores&tipo=departamento&hab=2
        const { distrito, tipoPropiedad, numHabitaciones } = req.query;

        if (!distrito || !tipoPropiedad || !numHabitaciones) {
            return res.status(400).json({ status: 'error', message: 'Faltan parámetros de consulta.' });
        }

        const comparacion = await EstimadorModel.getMarketComparison(distrito, tipoPropiedad, parseInt(numHabitaciones));
        
        if (!comparacion) {
            return res.status(404).json({ status: 'success', data: null, message: 'No se encontraron datos de mercado para esta configuración.' });
        }

        res.status(200).json({
            status: 'success',
            data: comparacion // { PrecioPromedio, PrecioPremium }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'error',
            message: 'Error al obtener la comparación de mercado.'
        });
    }
};