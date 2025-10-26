// Mock de propiedades registradas
const properties = [
    {
        id: 1,
        title: "Departamento moderno en Miraflores",
        location: "Miraflores",
        type: "departamento",
        metrage: 75,
        bedrooms: 2,
        bathrooms: 2,
        amenities: ['wifi', 'ac', 'furnished', 'kitchen'],
        highlights: ['views', 'pool'],
        security: ['lock', 'camera'],
        description: "Hermoso departamento con vista al mar, completamente amoblado."
    },
    {
        id: 2,
        title: "Casa con jardín en San Isidro",
        location: "San Isidro",
        type: "casa",
        metrage: 150,
        bedrooms: 3,
        bathrooms: 2,
        amenities: ['parking', 'wifi', 'kitchen', 'tv'],
        highlights: ['garden', 'terrace'],
        security: ['lock', 'alarm', 'guard'],
        description: "Espaciosa casa familiar con amplio jardín y cochera."
    },
    {
        id: 3,
        title: "Estudio céntrico en Centro de Lima",
        location: "Centro",
        type: "estudio",
        metrage: 35,
        bedrooms: 1,
        bathrooms: 1,
        amenities: ['wifi', 'furnished'],
        highlights: ['location'],
        security: ['lock'],
        description: "Perfecto para estudiantes o profesionales jóvenes."
    },
    {
        id: 4,
        title: "Oficina moderna en Surco",
        location: "Surco",
        type: "oficina",
        metrage: 80,
        bedrooms: 1,
        bathrooms: 1,
        amenities: ['wifi', 'ac', 'parking'],
        highlights: [],
        security: ['lock', 'camera', 'alarm'],
        description: "Oficina ejecutiva con todas las comodidades."
    }
];

let selectedProperty = null;
const closeBtn = document.getElementById('closeBtn');
const propertyList = document.getElementById('propertyList');
const analysisSection = document.getElementById('analysisSection');
const priceResult = document.getElementById('priceResult');
const comparisonSection = document.getElementById('comparisonSection');
const recommendationBox = document.getElementById('recommendationBox');
const publishBtn = document.getElementById('publishBtn');
const shareBtn = document.getElementById('shareBtn');

// Cargar propiedades
function loadProperties() {
    propertyList.innerHTML = properties.map(prop => `
        <div class="property-option" data-id="${prop.id}">
            <div class="property-name">${prop.title}</div>
            <div class="property-details">
                ${prop.metrage}m² • ${prop.bedrooms} hab • ${prop.location}
            </div>
        </div>
    `).join('');

    document.querySelectorAll('.property-option').forEach(option => {
        option.addEventListener('click', () => {
            document.querySelectorAll('.property-option').forEach(o => o.classList.remove('selected'));
            option.classList.add('selected');
            const propId = parseInt(option.dataset.id);
            selectedProperty = properties.find(p => p.id === propId);
            analyzePrice();
        });
    });
}

// Algoritmo de estimación de precio
function calculatePrice(property) {
    let basePrice = 0;
    const location = property.location.toLowerCase();

    // Precio base por m²
    const pricePerM2 = {
        'miraflores': 35,
        'san isidro': 40,
        'centro': 20,
        'surco': 38,
        'default': 25
    };

    const ppM2 = pricePerM2[location] || pricePerM2.default;
    basePrice = property.metrage * ppM2;

    // Ajuste por habitaciones
    basePrice += (property.bedrooms - 1) * 300;

    // Ajuste por baños
    basePrice += (property.bathrooms - 1) * 200;

    // Ajuste por amenidades
    const amenityBonus = {
        'wifi': 100,
        'parking': 150,
        'ac': 120,
        'furnished': 250,
        'kitchen': 180,
        'washer': 100,
        'tv': 80,
        'gym': 200
    };

    property.amenities.forEach(amenity => {
        basePrice += amenityBonus[amenity] || 0;
    });

    // Ajuste por destacadas
    const highlightBonus = {
        'views': 300,
        'pool': 400,
        'garden': 250,
        'terrace': 200,
        'location': 350
    };

    property.highlights.forEach(highlight => {
        basePrice += highlightBonus[highlight] || 0;
    });

    // Ajuste por seguridad
    if (property.security.length >= 2) basePrice += 150;

    return Math.round(basePrice);
}

// Datos de factores
function getFactors(property) {
    return [
        {
            name: 'Tamaño',
            value: property.metrage + 'm²',
            impact: property.metrage > 100 ? 'positive' : 'neutral'
        },
        {
            name: 'Habitaciones',
            value: property.bedrooms + ' hab',
            impact: property.bedrooms >= 2 ? 'positive' : 'neutral'
        },
        {
            name: 'Baños',
            value: property.bathrooms + ' baños',
            impact: property.bathrooms >= 2 ? 'positive' : 'neutral'
        },
        {
            name: 'Comodidades',
            value: property.amenities.length + ' seleccionadas',
            impact: property.amenities.length >= 3 ? 'positive' : property.amenities.length < 2 ? 'negative' : 'neutral'
        },
        {
            name: 'Seguridad',
            value: property.security.length > 0 ? 'Sí' : 'No',
            impact: property.security.length >= 2 ? 'positive' : property.security.length === 0 ? 'negative' : 'neutral'
        },
        {
            name: 'Ubicación',
            value: property.location,
            impact: ['Miraflores', 'San Isidro', 'Surco'].includes(property.location) ? 'positive' : 'neutral'
        }
    ];
}

// Analizar precio
function analyzePrice() {
    if (!selectedProperty) return;

    const estimatedPrice = calculatePrice(selectedProperty);
    const minPrice = Math.round(estimatedPrice * 0.85);
    const maxPrice = Math.round(estimatedPrice * 1.15);

    // Mostrar resultado
    document.getElementById('priceValue').textContent = 'S/ ' + estimatedPrice.toLocaleString('es-PE');
    document.getElementById('priceMin').textContent = minPrice.toLocaleString('es-PE');
    document.getElementById('priceMax').textContent = maxPrice.toLocaleString('es-PE');

    // Mostrar factores
    const factors = getFactors(selectedProperty);
    document.getElementById('factorsList').innerHTML = factors.map(factor => `
        <div class="factor-item">
            <div class="factor-label">
                <div class="factor-name">${factor.name}</div>
                <div class="factor-value">${factor.value}</div>
            </div>
            <div class="factor-impact impact-${factor.impact}">
                ${factor.impact === 'positive' ? '↑ Positivo' : factor.impact === 'negative' ? '↓ Negativo' : '→ Neutral'}
            </div>
        </div>
    `).join('');

    // Comparación
    const avgZonePrice = estimatedPrice * 0.9;
    const premiumPrice = estimatedPrice * 1.25;

    document.getElementById('value1').textContent = 'S/ ' + estimatedPrice.toLocaleString('es-PE');
    document.getElementById('value2').textContent = 'S/ ' + Math.round(avgZonePrice).toLocaleString('es-PE');
    document.getElementById('value3').textContent = 'S/ ' + Math.round(premiumPrice).toLocaleString('es-PE');

    document.getElementById('bar1').style.height = '60%';
    document.getElementById('bar2').style.height = '50%';
    document.getElementById('bar3').style.height = '80%';

    // Recomendaciones
    let recommendation = '';
    if (selectedProperty.amenities.length < 3) {
        recommendation += 'Agrega más comodidades para aumentar el valor. ';
    }
    if (selectedProperty.security.length === 0) {
        recommendation += 'Considera instalar sistemas de seguridad. ';
    }
    if (selectedProperty.highlights.length === 0) {
        recommendation += 'Destaca las características únicas de tu propiedad. ';
    }
    if (recommendation === '') {
        recommendation = '¡Tu propiedad está bien posicionada! Mantén buenas reseñas y considera ofertas especiales para baja temporada.';
    }

    document.getElementById('recommendationText').textContent = recommendation;

    // Mostrar secciones
    analysisSection.classList.remove('hidden');
    priceResult.classList.remove('hidden');
    comparisonSection.classList.remove('hidden');
    recommendationBox.classList.remove('hidden');
}

closeBtn.addEventListener('click', () => {
    if (confirm('¿Deseas cerrar?')) {
        window.history.back();
    }
});

publishBtn.addEventListener('click', () => {
    if (selectedProperty) {
        const price = document.getElementById('priceValue').textContent;
        alert(`Propiedad publicada a ${price} mensuales.\n\n"${selectedProperty.title}"\n${selectedProperty.location}`);
    }
});

shareBtn.addEventListener('click', () => {
    if (selectedProperty) {
        alert('Compartiendo estimación de precio...\n\nOpción para compartir con amigos, redes sociales o generar reportes PDF.');
    }
});

// Inicializar
loadProperties();
