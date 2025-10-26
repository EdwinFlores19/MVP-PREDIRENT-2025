/*
 * Propiedad.model.js
 * Modelo para la gestión de propiedades y sus atributos asociados.
 */

const { sql, poolPromise } = require('./dbConnection');

class PropiedadModel {

    /**
     * Crea una nueva propiedad y todas sus asociaciones (comodidades, etc.)
     * dentro de una transacción para garantizar la integridad de los datos.
     * @param {object} propertyData - Objeto con todos los datos del formulario (4-registrar-propiedad.html).
     * @param {number} usuarioID - El ID del usuario propietario.
     * @returns {Promise<object>} El objeto de la propiedad recién creada.
     */
    static async create(propertyData, usuarioID) {
        const {
            propertyType, accommodation, metrage, bedrooms, bathrooms,
            amenities, highlights, security, title, description,
            aspects, district, address, postal
        } = propertyData;

        let transaction;
        try {
            const pool = await poolPromise;
            transaction = pool.transaction(); // Iniciar una nueva transacción
            await transaction.begin();

            const request = new sql.Request(transaction); // Todas las consultas usarán esta transacción

            // === PASO 1: Insertar en la tabla principal 'Propiedades' ===
            request.input('UsuarioID', sql.Int, usuarioID);
            request.input('Titulo', sql.NVarChar(255), title);
            request.input('Descripcion', sql.NVarChar(sql.MAX), description);
            request.input('TipoPropiedad', sql.NVarChar(50), propertyType);
            request.input('TipoAlojamiento', sql.NVarChar(50), accommodation);
            request.input('Metraje', sql.Decimal(8, 2), metrage);
            request.input('NumHabitaciones', sql.Int, bedrooms);
            request.input('NumBanos', sql.Int, bathrooms);
            request.input('Distrito', sql.NVarChar(100), district);
            request.input('DireccionCompleta', sql.NVarChar(512), address);
            request.input('CodigoPostal', sql.NVarChar(10), postal);
            // Estado 'EnRevision' por defecto según el schema
            
            const resultPropiedad = await request.query(
                `INSERT INTO dbo.Propiedades (UsuarioID, Titulo, Descripcion, TipoPropiedad, TipoAlojamiento, Metraje, NumHabitaciones, NumBanos, Distrito, DireccionCompleta, CodigoPostal)
                 OUTPUT INSERTED.PropiedadID, INSERTED.Titulo
                 VALUES (@UsuarioID, @Titulo, @Descripcion, @TipoPropiedad, @TipoAlojamiento, @Metraje, @NumHabitaciones, @NumBanos, @Distrito, @DireccionCompleta, @CodigoPostal)`
            );
            
            const newPropiedadID = resultPropiedad.recordset[0].PropiedadID;

            // === PASO 2: Insertar en las tablas de unión (N:N) ===
            
            // Insertar Comodidades
            if (amenities && amenities.length > 0) {
                // Obtenemos los IDs de las comodidades
                const amenitiesResult = await new sql.Request(transaction)
                    .query(`SELECT ComodidadID, Nombre FROM dbo.Comodidades WHERE Nombre IN ('${amenities.join("','")}')`);
                
                for (const row of amenitiesResult.recordset) {
                    await new sql.Request(transaction)
                        .input('PropiedadID', sql.Int, newPropiedadID)
                        .input('ComodidadID', sql.Int, row.ComodidadID)
                        .query('INSERT INTO dbo.PropiedadComodidades (PropiedadID, ComodidadID) VALUES (@PropiedadID, @ComodidadID)');
                }
            }
            
            // Insertar Destacados
            if (highlights && highlights.length > 0) {
                const highlightsResult = await new sql.Request(transaction)
                    .query(`SELECT DestacadoID, Nombre FROM dbo.Destacados WHERE Nombre IN ('${highlights.join("','")}')`);
                
                for (const row of highlightsResult.recordset) {
                    await new sql.Request(transaction)
                        .input('PropiedadID', sql.Int, newPropiedadID)
                        .input('DestacadoID', sql.Int, row.DestacadoID)
                        .query('INSERT INTO dbo.PropiedadDestacados (PropiedadID, DestacadoID) VALUES (@PropiedadID, @DestacadoID)');
                }
            }

            // Insertar Seguridad
             if (security && security.length > 0) {
                const securityResult = await new sql.Request(transaction)
                    .query(`SELECT SeguridadTipoID, Nombre FROM dbo.SeguridadTipos WHERE Nombre IN ('${security.join("','")}')`);
                
                for (const row of securityResult.recordset) {
                    await new sql.Request(transaction)
                        .input('PropiedadID', sql.Int, newPropiedadID)
                        .input('SeguridadTipoID', sql.Int, row.SeguridadTipoID)
                        .query('INSERT INTO dbo.PropiedadSeguridad (PropiedadID, SeguridadTipoID) VALUES (@PropiedadID, @SeguridadTipoID)');
                }
            }
            
            // Insertar Aspectos
            if (aspects && aspects.length > 0) {
                const aspectsResult = await new sql.Request(transaction)
                    .query(`SELECT AspectoID, Nombre FROM dbo.Aspectos WHERE Nombre IN ('${aspects.join("','")}')`);
                
                for (const row of aspectsResult.recordset) {
                    await new sql.Request(transaction)
                        .input('PropiedadID', sql.Int, newPropiedadID)
                        .input('AspectoID', sql.Int, row.AspectoID)
                        .query('INSERT INTO dbo.PropiedadAspectos (PropiedadID, AspectoID) VALUES (@PropiedadID, @AspectoID)');
                }
            }

            // === PASO 3: Confirmar la transacción ===
            await transaction.commit();
            
            return resultPropiedad.recordset[0];

        } catch (error) {
            console.error('Error en PropiedadModel.create (Transacción):', error.message);
            // Si algo falla, revertir todos los cambios
            if (transaction) {
                await transaction.rollback();
            }
            throw new Error('Error al registrar la propiedad.');
        }
    }

    /**
     * Obtiene las propiedades de un usuario específico (para el dashboard).
     * @param {number} usuarioID - El ID del usuario.
     * @returns {Promise<Array<object>>} Lista de propiedades.
     */
    static async getPropertiesByUserId(usuarioID) {
        try {
            const pool = await poolPromise;
            const request = pool.request();
            
            request.input('UsuarioID', sql.Int, usuarioID);

            const result = await request.query(
                `SELECT PropiedadID, Titulo, TipoPropiedad, Distrito, EstadoPropiedad,
                 (SELECT TOP 1 MontoTotalIngreso FROM dbo.Reservas R WHERE R.PropiedadID = P.PropiedadID AND R.EstadoReserva = 'Confirmada' AND MONTH(R.FechaInicio) = MONTH(GETDATE()) AND YEAR(R.FechaInicio) = YEAR(GETDATE())) AS IngresoMesActual
                 FROM dbo.Propiedades P
                 WHERE P.UsuarioID = @UsuarioID
                 ORDER BY P.FechaRegistro DESC`
            );
            
            return result.recordset;

        } catch (error) {
            console.error('Error en PropiedadModel.getPropertiesByUserId:', error.message);
            throw new Error('Error al obtener las propiedades del usuario.');
        }
    }
}

module.exports = PropiedadModel;