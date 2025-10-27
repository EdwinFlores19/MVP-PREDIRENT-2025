const { sql, poolPromise } = require('./dbConnection');

class PropiedadModel {

    static async create(propertyData, usuarioID) {
        const {
            tipoPropiedad, tipoAlojamiento, direccion, apartamento, distrito, codigoPostal, provincia, // mostrarUbicacionExacta no se usa
            huespedes, habitaciones, camas, baños, comodidades, comodidadesDestacadas, seguridad, titulo, descripcion, aspectos
        } = propertyData;

        let transaction;
        try {
            const pool = await poolPromise;
            transaction = pool.transaction();
            await transaction.begin();

            const request = new sql.Request(transaction);

            // === PASO 1: Insertar en la tabla principal 'Propiedades' ===
            request.input('UsuarioID', sql.Int, usuarioID);
            request.input('Titulo', sql.NVarChar(255), titulo);
            request.input('Descripcion', sql.NVarChar(sql.MAX), descripcion);
            request.input('TipoPropiedad', sql.NVarChar(50), tipoPropiedad);
            request.input('TipoAlojamiento', sql.NVarChar(50), tipoAlojamiento);
            request.input('NumHuespedes', sql.Int, huespedes);
            request.input('NumHabitaciones', sql.Int, habitaciones);
            request.input('NumCamas', sql.Int, camas);
            request.input('NumBanos', sql.Int, baños);
            request.input('Distrito', sql.NVarChar(100), distrito);
            request.input('DireccionCompleta', sql.NVarChar(512), direccion);
            request.input('CodigoPostal', sql.NVarChar(10), codigoPostal);
            request.input('Provincia', sql.NVarChar(100), provincia);

            const resultPropiedad = await request.query(
                `INSERT INTO dbo.Propiedades (UsuarioID, Titulo, Descripcion, TipoPropiedad, TipoAlojamiento, NumHuespedes, NumHabitaciones, NumCamas, NumBanos, Distrito, DireccionCompleta, CodigoPostal, Provincia)
                 OUTPUT INSERTED.PropiedadID
                 VALUES (@UsuarioID, @Titulo, @Descripcion, @TipoPropiedad, @TipoAlojamiento, @NumHuespedes, @NumHabitaciones, @NumCamas, @NumBanos, @Distrito, @DireccionCompleta, @CodigoPostal, @Provincia)`
            );
            
            const newPropiedadID = resultPropiedad.recordset[0].PropiedadID;

            // Fallback Robusto sin TVP: Bucle transaccional
            const insertJoinData = async (values, masterTable, masterIdColumn, joinTable, joinIdColumn) => {
                if (values && values.length > 0) {
                    for (const value of values) {
                        const subRequest = new sql.Request(transaction);
                        subRequest.input('PropiedadID', sql.Int, newPropiedadID);
                        subRequest.input('Nombre', sql.NVarChar(100), value);
                        
                        await subRequest.query(
                            `INSERT INTO dbo.${joinTable} (PropiedadID, ${joinIdColumn})
                             SELECT @PropiedadID, T.${masterIdColumn}
                             FROM dbo.${masterTable} T WHERE T.Nombre = @Nombre`
                        );
                    }
                }
            };

            await insertJoinData(comodidades, 'Comodidades', 'ComodidadID', 'PropiedadComodidades', 'ComodidadID');
            await insertJoinData(comodidadesDestacadas, 'Destacados', 'DestacadoID', 'PropiedadDestacados', 'DestacadoID');
            await insertJoinData(seguridad, 'SeguridadTipos', 'SeguridadTipoID', 'PropiedadSeguridad', 'SeguridadTipoID');
            await insertJoinData(aspectos, 'Aspectos', 'AspectoID', 'PropiedadAspectos', 'AspectoID');

            await transaction.commit();
            
            return { PropiedadID: newPropiedadID };

        } catch (error) {
            console.error('--- ERROR DE TRANSACCIÓN EN PropiedadModel.create ---');
            console.error('Mensaje:', error.message);
            if (error.originalError) {
                console.error('Error Original de SQL Server:', error.originalError.message);
            }
            console.error('Stack:', error.stack);

            if (transaction) {
                try {
                    await transaction.rollback();
                } catch (rollbackError) {
                    console.error('Error al intentar revertir la transacción:', rollbackError);
                }
            }
            throw new Error('Error al registrar la propiedad.');
        }
    }

    static async getPropertiesByUserId(usuarioID) {
        // ... (código existente sin cambios)
    }
}

module.exports = PropiedadModel;