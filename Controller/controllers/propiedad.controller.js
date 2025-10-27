const PropiedadModel = require('../../Model/Propiedad.model');
const NodeCache = require('node-cache');
const { v4: uuidv4 } = require('uuid'); // Para correlationId

const propertyCountCache = new NodeCache({ stdTTL: 60 });

const safeInt = (value, defaultValue = 1) => {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
};

exports.crearPropiedad = async (req, res) => {
    const correlationId = uuidv4();
    try {
        const usuarioID = req.userId;
        const propertyData = req.body;
        // ... (sanitización de datos)
        console.log(`[${correlationId}] Iniciando creación de propiedad para usuario ${usuarioID}`);
        const newPropiedad = await PropiedadModel.create(propertyData, usuarioID);
        propertyCountCache.del(`active_properties_count_${usuarioID}`);
        console.log(`[${correlationId}] Caché invalidado para usuario ${usuarioID}`);
        res.status(201).json({ status: 'success', data: newPropiedad });
    } catch (error) {
        console.error(`[${correlationId}] Error en crearPropiedad:`, error);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor.', id: correlationId });
    }
};

exports.getMisPropiedades = async (req, res) => {
    const correlationId = uuidv4();
    try {
        const usuarioID = req.userId;
        console.log(`[${correlationId}] Obteniendo propiedades para usuario ${usuarioID}`);
        const propiedades = await PropiedadModel.getPropertiesByUserId(usuarioID);

        if (!propiedades || !Array.isArray(propiedades)) {
            console.warn(`[${correlationId}] PropiedadModel.getPropertiesByUserId devolvió un valor no esperado:`, propiedades);
            return res.status(200).json({ status: 'success', data: [] });
        }

        res.status(200).json({ status: 'success', data: propiedades });

    } catch (error) {
        console.error(`[${correlationId}] Error en getMisPropiedades:`, error);
        res.status(500).json({ status: 'error', message: 'Error al obtener las propiedades.', id: correlationId });
    }
};

exports.contarPropiedadesActivas = async (req, res) => {
    const usuarioID = req.userId;
    const cacheKey = `active_properties_count_${usuarioID}`;
    const correlationId = uuidv4();

    try {
        const cachedCount = propertyCountCache.get(cacheKey);
        if (cachedCount !== undefined) {
            console.log(`[${correlationId}] Cache HIT para contador del usuario ${usuarioID}`);
            return res.status(200).json({ status: 'success', data: { count: cachedCount } });
        }

        console.log(`[${correlationId}] Cache MISS para contador del usuario ${usuarioID}. Consultando DB...`);
        const count = await PropiedadModel.getActiveCountByUserId(usuarioID);
        propertyCountCache.set(cacheKey, count);

        res.status(200).json({ status: 'success', data: { count } });

    } catch (error) {
        console.error(`[${correlationId}] Error en contarPropiedadesActivas:`, error);
        res.status(500).json({ status: 'error', message: 'Error al contar propiedades.', id: correlationId });
    }
};

// ... (código del estimador, si reside aquí)
