document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    updateGenerateButton();
});

const state = {
    selectedProperties: [],
    selectedContent: [],
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
};

const propertyList = document.getElementById('propertyList');
const contentOptions = document.getElementById('contentOptions');
const generateBtn = document.getElementById('generateBtn');
const successModal = document.getElementById('successModal');
const downloadBtn = document.getElementById('downloadBtn');
const backButton = document.querySelector('.back-button');
const monthSelect = document.getElementById('monthSelect');
const yearSelect = document.getElementById('yearSelect');

// Inicializar selects de fecha
monthSelect.value = state.month;
yearSelect.value = state.year;

function toggleProperty(propertyItem) {
    const propertyId = propertyItem.dataset.property;
    const checkbox = propertyItem.querySelector('.custom-checkbox');
    const index = state.selectedProperties.indexOf(propertyId);

    if (index > -1) {
        state.selectedProperties.splice(index, 1);
        propertyItem.classList.remove('selected');
        checkbox.classList.remove('checked');
    } else {
        state.selectedProperties.push(propertyId);
        propertyItem.classList.add('selected');
        checkbox.classList.add('checked');
    }
    updateGenerateButton();
}

function toggleContent(contentItem) {
    const contentId = contentItem.dataset.content;
    const checkbox = contentItem.querySelector('.custom-checkbox');
    const index = state.selectedContent.indexOf(contentId);

    if (index > -1) {
        state.selectedContent.splice(index, 1);
        checkbox.classList.remove('checked');
    } else {
        state.selectedContent.push(contentId);
        checkbox.classList.add('checked');
    }
    updateGenerateButton();
}

function updateGenerateButton() {
    generateBtn.disabled = !(state.selectedProperties.length > 0 && state.selectedContent.length > 0);
}

async function generateReport() {
    generateBtn.classList.add('loading');
    generateBtn.disabled = true;

    const reportData = {
        propiedadID: state.selectedProperties,
        mes: state.month,
        año: state.year,
        tiposContenido: state.selectedContent,
    };

    try {
        const response = await fetchWithAuth('/reportes/generar', {
            method: 'POST',
            body: JSON.stringify(reportData),
        });

        if (response.ok) {
            const result = await response.json();
            showSuccessModal(result.reportUrl); // Asumimos que la API devuelve una URL para el reporte
        } else {
            const error = await response.json();
            alert(`Error al generar el reporte: ${error.message}`);
        }
    } catch (error) {
        alert('Error de conexión al generar el reporte.');
    } finally {
        generateBtn.classList.remove('loading');
        updateGenerateButton();
    }
}

function showSuccessModal(reportUrl) {
    successModal.classList.add('show');
    downloadBtn.onclick = () => downloadReport(reportUrl);
}

function downloadReport(reportUrl) {
    console.log(`Descargando reporte desde: ${reportUrl}`);
    // En un caso real, se podría abrir la URL en una nueva pestaña o usar una librería para forzar la descarga.
    window.open(reportUrl, '_blank');
    successModal.classList.remove('show');
    resetForm();
}

function resetForm() {
    state.selectedProperties = [];
    state.selectedContent = [];
    document.querySelectorAll('.property-item, .content-item .custom-checkbox').forEach(el => {
        el.classList.remove('selected', 'checked');
    });
    updateGenerateButton();
}

// Event Listeners
propertyList.addEventListener('click', e => e.target.closest('.property-item') && toggleProperty(e.target.closest('.property-item')));
contentOptions.addEventListener('click', e => e.target.closest('.content-item') && toggleContent(e.target.closest('.content-item')));
generateBtn.addEventListener('click', generateReport);
backButton.addEventListener('click', () => window.history.back());
monthSelect.addEventListener('change', e => state.month = parseInt(e.target.value));
yearSelect.addEventListener('change', e => state.year = parseInt(e.target.value));
successModal.addEventListener('click', e => e.target === successModal && successModal.classList.remove('show'));