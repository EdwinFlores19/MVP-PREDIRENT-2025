// 📁 Controller/controllers/reporte.controller.js
const ReporteModel = require('../../Model/Reporte.model');
const { validationResult } = require('../middleware/validators.middleware'); // Importar desde nuestro validador

exports.generarReporte = async (req, res) => {
    // 1. Validar datos
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ status: 'error', errors: errors.array() });
    }

    try {
        const usuarioID = req.userId;
        const { propiedadID, mes, anio, tiposContenido } = req.body;
        
        let reporteData = {};

        // 2. Recopilar datos según lo solicitado
        if (tiposContenido.includes('Resumen Financiero')) {
            reporteData.financiero = await ReporteModel.getFinancialData(propiedadID, mes, anio);
        }
        if (tiposContenido.includes('Estado de Ocupación')) {
            reporteData.ocupacion = await ReporteModel.getOccupancyData(propiedadID, mes, anio);
        }
        // ... (Aquí irían las llamadas para 'Regulaciones' y 'Mantenimiento')

        // 3. Guardar un registro del reporte en la BD
        const registro = await ReporteModel.createReportEntry(usuarioID, propiedadID, mes, anio, tiposContenido);

        // 4. Enviar los datos (En un caso real, aquí se generaría un PDF/Excel)
        res.status(201).json({
            status: 'success',
            message: 'Reporte generado y guardado.',
            reporteID: registro.reporteID,
            nombreArchivo: registro.nombreArchivo,
            data: reporteData // Devolvemos el JSON de datos
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'error',
            message: 'Error al generar el reporte.'
        });
    }
};