// 📁 Model/Reporte.model.js
// (Este modelo es necesario para que el controlador funcione)
const { sql, poolPromise } = require('./dbConnection');

class ReporteModel {

    // Obtener datos financieros (Ingresos/Gastos)
    static async getFinancialData(propiedadID, mes, anio) {
        try {
            const pool = await poolPromise;
            const request = pool.request();
            request.input('PropiedadID', sql.Int, propiedadID);
            request.input('Mes', sql.Int, mes);
            request.input('Anio', sql.Int, anio);

            const result = await request.query(
                `SELECT TipoTransaccion, SUM(Monto) AS Total 
                 FROM dbo.Transacciones
                 WHERE PropiedadID = @PropiedadID 
                   AND MONTH(FechaTransaccion) = @Mes 
                   AND YEAR(FechaTransaccion) = @Anio
                 GROUP BY TipoTransaccion`
            );
            return result.recordset;
        } catch (error) {
            console.error('Error en getFinancialData:', error.message);
            throw error;
        }
    }

    // Obtener datos de ocupación
    static async getOccupancyData(propiedadID, mes, anio) {
         try {
            const pool = await poolPromise;
            const request = pool.request();
            request.input('PropiedadID', sql.Int, propiedadID);
            request.input('Mes', sql.Int, mes);
            request.input('Anio', sql.Int, anio);
            
            // Lógica compleja para calcular días ocupados vs. vacantes en un mes
            // (Esta es una simplificación)
            const result = await request.query(
                `SELECT SUM(DATEDIFF(day, FechaInicio, FechaFin) + 1) AS DiasOcupados
                 FROM dbo.Reservas
                 WHERE PropiedadID = @PropiedadID 
                   AND EstadoReserva = 'Confirmada'
                   AND (
                       (MONTH(FechaInicio) = @Mes AND YEAR(FechaInicio) = @Anio) OR
                       (MONTH(FechaFin) = @Mes AND YEAR(FechaFin) = @Anio)
                   )` // Nota: Esta consulta debe ser más compleja para manejar rangos que cruzan meses
            );
            return result.recordset[0];
        } catch (error) {
            console.error('Error en getOccupancyData:', error.message);
            throw error;
        }
    }
    
    // Guardar registro del reporte generado
    static async createReportEntry(usuarioID, propiedadID, mes, anio, tiposContenido) {
         try {
            const pool = await poolPromise;
            const transaction = pool.transaction();
            await transaction.begin();

            const nombreArchivo = `Reporte_${propiedadID}_${anio}_${mes}.json`; // O .pdf
            
            const request = new sql.Request(transaction);
            request.input('UsuarioID', sql.Int, usuarioID);
            request.input('PropiedadID', sql.Int, propiedadID);
            request.input('Mes', sql.Int, mes);
            request.input('Anio', sql.Int, anio);
            request.input('NombreArchivo', sql.NVarChar(255), nombreArchivo);
            request.input('RutaAlmacenamiento', sql.NVarChar(512), `/reports/${nombreArchivo}`);
            
            const resultReporte = await request.query(
                `INSERT INTO dbo.Reportes (UsuarioID, PropiedadID, Mes, Anio, NombreArchivo, RutaAlmacenamiento)
                 OUTPUT INSERTED.ReporteID
                 VALUES (@UsuarioID, @PropiedadID, @Mes, @Anio, @NombreArchivo, @RutaAlmacenamiento)`
            );
            
            const newReporteID = resultReporte.recordset[0].ReporteID;
            
            // Insertar los tipos de contenido
            // Asegurarse de que los nombres coincidan con la BD
            const tiposResult = await new sql.Request(transaction)
                .query(`SELECT TipoContenidoID, Nombre FROM dbo.ReporteTiposContenido WHERE Nombre IN ('${tiposContenido.join("','")}')`);
            
            for (const row of tiposResult.recordset) {
                await new sql.Request(transaction)
                    .input('ReporteID', sql.Int, newReporteID)
                    .input('TipoContenidoID', sql.Int, row.TipoContenidoID)
                    .query('INSERT INTO dbo.ReporteContenidos (ReporteID, TipoContenidoID) VALUES (@ReporteID, @TipoContenidoID)');
            }

            await transaction.commit();
            return { reporteID: newReporteID, nombreArchivo };

        } catch (error) {
            if (transaction) await transaction.rollback();
            console.error('Error en createReportEntry:', error.message);
            throw error;
        }
    }
}

module.exports = ReporteModel;