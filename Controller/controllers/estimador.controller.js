const { spawn } = require('child_process');
const fetch = require('node-fetch');

const normalizeAndSanitize = (rawData) => {
    const safeInt = (value, defaultValue = 1) => {
        const parsed = parseInt(value, 10);
        return isNaN(parsed) ? defaultValue : parsed;
    };
    const accommodationMapping = { 'entero': 'entire', 'habitacion': 'room', 'compartida': 'shared' };

    return {
        TipoPropiedad: rawData.tipoPropiedad || '',
        TipoAlojamiento: accommodationMapping[rawData.tipoAlojamiento] || rawData.tipoAlojamiento || '',
        Distrito: rawData.distrito || '',
        Provincia: rawData.provincia || '',
        huespedes: safeInt(rawData.huespedes),
        habitaciones: safeInt(rawData.habitaciones),
        camas: safeInt(rawData.camas),
        baños: safeInt(rawData.baños || rawData.banos),
        comodidades: rawData.comodidades || []
    };
};

const predictWithFastAPI = async (payload) => {
    try {
        const response = await fetch('http://localhost:8000/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            timeout: 5000 // Timeout de 5 segundos
        });
        if (!response.ok) throw new Error(`FastAPI response not OK: ${response.status}`);
        return response.json();
    } catch (error) {
        console.error("Error al contactar la API de FastAPI:", error.message);
        throw new Error("El microservicio de predicción no está disponible.");
    }
};

const predictWithChildProcess = (payload) => {
    return new Promise((resolve, reject) => {
        const process = spawn('python', ['python/predict.py', JSON.stringify(payload)]);
        let data = '';
        let errorData = '';

        process.stdout.on('data', (chunk) => data += chunk.toString());
        process.stderr.on('data', (chunk) => errorData += chunk.toString());

        const timeout = setTimeout(() => {
            process.kill();
            reject(new Error('Timeout: El script de Python tardó demasiado.'));
        }, 10000);

        process.on('close', (code) => {
            clearTimeout(timeout);
            if (code === 0) {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(new Error('La respuesta del script de Python no es un JSON válido.'));
                }
            } else {
                reject(new Error(`Error en script de Python (código ${code}): ${errorData}`))
            }
        });
    });
};

exports.predecirPrecio = async (req, res) => {
    try {
        const sanitizedPayload = normalizeAndSanitize(req.body);
        let predictionResult;

        if (process.env.USE_FASTAPI === 'true') {
            predictionResult = await predictWithFastAPI(sanitizedPayload);
        } else {
            try {
                predictionResult = await predictWithChildProcess(sanitizedPayload);
            } catch (error) {
                console.warn('--- ADVERTENCIA: Fallback a estimación dummy ---');
                console.warn('Causa:', error.message);
                console.warn('Asegúrate de que Python esté instalado y las dependencias de python/requirements.txt estén en el entorno correcto.');
                // Fallback a un modelo dummy si el script local falla
                predictionResult = { precio_predicho: 1450.0, dummy: true };
            }
        }

        if (predictionResult.error) {
            throw new Error(predictionResult.error);
        }

        res.status(200).json({ 
            status: 'success', 
            data: predictionResult 
        });

    } catch (error) {
        console.error('Error final en el controlador de predicción:', error.message);
        res.status(500).json({ 
            status: 'error', 
            message: error.message || 'No se pudo obtener la predicción.' 
        });
    }
};