document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadUserProperties();
});

let userProperties = [];
let selectedProperty = null;

const propertyList = document.getElementById('propertyList');
const analysisContainer = document.getElementById('analysisContainer');
const infoBox = document.getElementById('infoBox');
const analysisSection = document.getElementById('analysisSection');
const priceResult = document.getElementById('priceResult');
const comparisonSection = document.getElementById('comparisonSection');
const recommendationBox = document.getElementById('recommendationBox');

async function loadUserProperties() {
    propertyList.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    try {
        const response = await fetchWithAuth('/propiedades/mis-propiedades');
        if (response.ok) {
            userProperties = await response.json();
            renderPropertySelector(userProperties);
        } else {
            propertyList.innerHTML = '<p>Error al cargar propiedades.</p>';
        }
    } catch (error) {
        propertyList.innerHTML = '<p>Error de conexión.</p>';
    }
}

function renderPropertySelector(properties) {
    if (properties.length === 0) {
        propertyList.innerHTML = '<p>No tienes propiedades registradas.</p>';
        return;
    }
    propertyList.innerHTML = properties.map(prop => `
        <div class="property-option" data-id="${prop._id}">
            <div class="property-name">${prop.titulo}</div>
            <div class="property-details">${prop.metrosCuadrados}m² • ${prop.habitaciones} hab • ${prop.distrito}</div>
        </div>
    `).join('');

    document.querySelectorAll('.property-option').forEach(option => {
        option.addEventListener('click', () => {
            document.querySelectorAll('.property-option').forEach(o => o.classList.remove('selected'));
            option.classList.add('selected');
            selectedProperty = userProperties.find(p => p._id === option.dataset.id);
            analyzePrice(selectedProperty);
        });
    });
}

async function analyzePrice(property) {
    infoBox.classList.add('hidden');
    showLoading(true);

    try {
        const [priceRes, comparisonRes] = await Promise.all([
            fetchWithAuth('/estimador/calcular', { method: 'POST', body: JSON.stringify(property) }),
            fetchWithAuth(`/estimador/comparacion?distrito=${property.distrito}&metrosCuadrados=${property.metrosCuadrados}`)
        ]);

        if (priceRes.ok && comparisonRes.ok) {
            const priceData = await priceRes.json();
            const comparisonData = await comparisonRes.json();
            displayResults(priceData, comparisonData, property);
        } else {
            throw new Error('Error al obtener datos de la API');
        }
    } catch (error) {
        alert('No se pudo realizar el análisis. Inténtalo de nuevo.');
    } finally {
        showLoading(false);
    }
}

function displayResults(priceData, comparisonData, property) {
    // Precio estimado
    document.getElementById('priceValue').textContent = `S/ ${priceData.precioEstimado.toLocaleString()}`;
    document.getElementById('priceMin').textContent = priceData.rango[0].toLocaleString();
    document.getElementById('priceMax').textContent = priceData.rango[1].toLocaleString();

    // Factores
    document.getElementById('factorsList').innerHTML = priceData.factores.map(f => `
        <div class="factor-item">
            <div class="factor-label"><div class="factor-name">${f.nombre}</div><div class="factor-value">${f.valor}</div></div>
            <div class="factor-impact impact-${f.impacto}">${f.impacto === 'positive' ? '↑ Positivo' : '↓ Negativo'}</div>
        </div>
    `).join('');

    // Gráfico de comparación
    document.getElementById('value1').textContent = `S/ ${priceData.precioEstimado.toLocaleString()}`;
    document.getElementById('value2').textContent = `S/ ${comparisonData.promedioZona.toLocaleString()}`;
    document.getElementById('value3').textContent = `S/ ${comparisonData.promedioPremium.toLocaleString()}`;
    // Lógica para alturas de barras...

    // Recomendación
    document.getElementById('recommendationText').textContent = priceData.recomendacion;

    [analysisSection, priceResult, comparisonSection, recommendationBox].forEach(el => el.classList.remove('hidden'));
}

function showLoading(isLoading) {
    if (isLoading) {
        analysisContainer.innerHTML = '<div class="loading"><div class="spinner"></div><p>Analizando mercado...</p></div>';
    } else {
        const loadingEl = analysisContainer.querySelector('.loading');
        if (loadingEl) loadingEl.remove();
    }
}

document.getElementById('closeBtn').addEventListener('click', () => window.history.back());