document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadUserProperties();
    setupEventListeners();
});

let userProperties = [];
let selectedProperty = null;

const propertyList = document.getElementById('propertyList');
const infoBox = document.getElementById('infoBox');
const analysisSection = document.getElementById('analysisSection');
const priceResult = document.getElementById('priceResult');

async function loadUserProperties() {
    showLoading(true, '#propertyList', '<div class="loading"><div class="spinner"></div></div>');
    try {
        // CORRECCIÓN: La ruta no debe incluir /api, ya que fetchWithAuth lo añade.
        const response = await fetchWithAuth('/propiedades/mis-propiedades');
        
        if (response.ok) {
            const responseData = await response.json();
            // CORRECCIÓN: El controlador ahora envuelve la respuesta en un objeto { data: [...] }
            userProperties = responseData.data;
            console.log('Propiedades recibidas del backend:', userProperties);
            renderPropertySelector(userProperties);
        } else {
            const errorData = await response.text();
            console.error('Error del backend al cargar propiedades:', response.status, errorData);
            propertyList.innerHTML = `<p>Error ${response.status} al cargar propiedades. Revisa la consola del servidor.</p>`;
        }
    } catch (error) {
        console.error('Error de red o de conexión:', error);
        propertyList.innerHTML = '<p>Error de conexión. ¿El servidor está encendido?</p>';
    } finally {
        showLoading(false, '#propertyList');
    }
}

function renderPropertySelector(properties) {
    if (!properties || properties.length === 0) {
        propertyList.innerHTML = '<p>No tienes propiedades registradas para estimar.</p>';
        infoBox.classList.remove('hidden');
        return;
    }
    infoBox.classList.add('hidden');
    propertyList.innerHTML = properties.map(prop => `
        <div class="property-option" data-id="${prop.PropiedadID}">
            <div class="property-name">${prop.Titulo}</div>
            <div class="property-details">${prop.TipoPropiedad} • ${prop.Distrito}</div>
        </div>
    `).join('');

    document.querySelectorAll('.property-option').forEach(option => {
        option.addEventListener('click', () => {
            document.querySelectorAll('.property-option').forEach(o => o.classList.remove('selected'));
            option.classList.add('selected');
            selectedProperty = userProperties.find(p => p.PropiedadID.toString() === option.dataset.id);
            document.getElementById('btnCalcularPrecio').disabled = false;
        });
    });
}

async function calculateAndShowPrice() {
    if (!selectedProperty) {
        alert('Por favor, selecciona una propiedad primero.');
        return;
    }
    showLoading(true, '#analysisSection', '<div class="loading"><div class="spinner"></div><p>Analizando mercado...</p></div>');
    
    try {
        // CORRECCIÓN: La ruta no debe incluir /api
        const response = await fetchWithAuth('/estimador/calcular', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ propiedadId: selectedProperty.PropiedadID })
        });

        if (response.ok) {
            const result = await response.json();
            displayResults(result.data);
        } else {
            throw new Error('No se pudo obtener la estimación.');
        }
    } catch (error) {
        alert('No se pudo realizar el análisis. Inténtalo de nuevo.');
        console.error('Error en analyzePrice:', error);
    } finally {
        showLoading(false, '#analysisSection');
    }
}

function displayResults(data) {
    priceResult.classList.remove('hidden');
    let displayText = `<strong>Precio Sugerido:</strong> S/ ${data.precio_predicho.toLocaleString()}`;
    if (data.fallback) {
        displayText += ' <small><em>(estimación básica)</em></small>';
    }
    document.getElementById('priceValue').innerHTML = displayText;
}

function showLoading(isLoading, containerSelector, content) {
    const container = document.querySelector(containerSelector);
    if (!container) return;
    if (isLoading) {
        container.innerHTML = content;
    } else {
        const loadingEl = container.querySelector('.loading');
        if (loadingEl) loadingEl.parentElement.innerHTML = '';
    }
}

function setupEventListeners() {
    document.getElementById('closeBtn').addEventListener('click', () => window.history.back());
    const calculateBtn = document.getElementById('btnCalcularPrecio');
    if(calculateBtn) {
        calculateBtn.disabled = true; // Deshabilitado hasta que se seleccione una propiedad
        calculateBtn.addEventListener('click', calculateAndShowPrice);
    }
}
