/*
 * Estimador.model.js
 * Modelo para la lógica de negocio del estimador de precios.
 */

const { sql, poolPromise } = require('./dbConnection');

class EstimadorModel {

    /**
     * Lógica de negocio pura para calcular el precio base de una propiedad.
     * (Basado en el script de '9-estimar-precio.html').
     * @param {object} property - Objeto de propiedad.
     * @returns {number} El precio estimado.
     */
    static calculatePrice(property) {
        let basePrice = 0;
        const location = property.location.toLowerCase();

        // 1. Precio base por m² según distrito
        const pricePerM2 = {
            'miraflores': 35,
            'san isidro': 40,
            'centro': 20,
            'surco': 38,
            'default': 25
        };
        const ppM2 = pricePerM2[location] || pricePerM2.default;
        basePrice = property.metrage * ppM2;

        // 2. Ajuste por habitaciones
        basePrice += (property.bedrooms - 1) * 300;

        // 3. Ajuste por baños
        basePrice += (property.bathrooms - 1) * 200;

        // 4. Ajuste por amenidades (suponiendo que 'amenities' es un array de strings)
        const amenityBonus = {
            'wifi': 100, 'parking': 150, 'ac': 120, 'furnished': 250,
            'kitchen': 180, 'washer': 100, 'tv': 80, 'gym': 200
        };
        property.amenities.forEach(amenity => {
            basePrice += amenityBonus[amenity] || 0;
        });

        // 5. Ajuste por destacadas (suponiendo que 'highlights' es un array de strings)
        const highlightBonus = {
            'views': 300, 'pool': 400, 'garden': 250, 'terrace': 200, 'location': 350
        };
        property.highlights.forEach(highlight => {
            basePrice += highlightBonus[highlight] || 0;
        });

        // 6. Ajuste por seguridad
        if (property.security && property.security.length >= 2) {
            basePrice += 150;
        }

        return Math.round(basePrice);
    }

    /**
     * Obtiene los datos de precios promedio y premium del mercado.
     * @param {string} distrito - Distrito de la propiedad.
     * @param {string} tipoPropiedad - 'casa', 'departamento', etc.
     * @param {number} numHabitaciones - Número de habitaciones.
     * @returns {Promise<object|null>} Objeto con { PrecioPromedio, PrecioPremium } o null.
     */
    static async getMarketComparison(distrito, tipoPropiedad, numHabitaciones) {
        try {
            const pool = await poolPromise;
            const request = pool.request();
            
            request.input('Distrito', sql.NVarChar(100), distrito);
            request.input('TipoPropiedad', sql.NVarChar(50), tipoPropiedad);
            request.input('NumHabitaciones', sql.Int, numHabitaciones);

            const result = await request.query(
                `SELECT PrecioPromedio, PrecioPremium 
                 FROM dbo.PreciosMercado 
                 WHERE Distrito = @Distrito 
                   AND TipoPropiedad = @TipoPropiedad 
                   AND NumHabitaciones = @NumHabitaciones`
            );
            
            return result.recordset[0] || null;

        } catch (error) {
            console.error('Error en EstimadorModel.getMarketComparison:', error.message);
            throw new Error('Error al obtener datos de mercado.');
        }
    }
}

module.exports = EstimadorModel;