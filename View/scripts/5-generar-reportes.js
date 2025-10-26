// Estado de la aplicación
const state = {
  selectedProperties: [],
  selectedContent: [],
  month: 9,
  year: 2025
};

// Elementos del DOM
const propertyList = document.getElementById('propertyList');
const contentOptions = document.getElementById('contentOptions');
const generateBtn = document.getElementById('generateBtn');
const successModal = document.getElementById('successModal');
const downloadBtn = document.getElementById('downloadBtn');
const backButton = document.querySelector('.back-button');
const monthSelect = document.getElementById('monthSelect');
const yearSelect = document.getElementById('yearSelect');

// Función para manejar la selección de propiedades
function toggleProperty(propertyItem) {
  const propertyId = propertyItem.dataset.property;
  const checkbox = propertyItem.querySelector('.custom-checkbox');
  
  if (state.selectedProperties.includes(propertyId)) {
    state.selectedProperties = state.selectedProperties.filter(id => id !== propertyId);
    propertyItem.classList.remove('selected');
    checkbox.classList.remove('checked');
  } else {
    state.selectedProperties.push(propertyId);
    propertyItem.classList.add('selected');
    checkbox.classList.add('checked');
  }
  
  updateGenerateButton();
}

// Función para manejar la selección de contenido
function toggleContent(contentItem) {
  const contentId = contentItem.dataset.content;
  const checkbox = contentItem.querySelector('.custom-checkbox');
  
  if (state.selectedContent.includes(contentId)) {
    state.selectedContent = state.selectedContent.filter(id => id !== contentId);
    checkbox.classList.remove('checked');
  } else {
    state.selectedContent.push(contentId);
    checkbox.classList.add('checked');
  }
  
  updateGenerateButton();
}

// Función para actualizar el estado del botón de generar
function updateGenerateButton() {
  if (state.selectedProperties.length > 0 && state.selectedContent.length > 0) {
    generateBtn.disabled = false;
  } else {
    generateBtn.disabled = true;
  }
}

// Función para generar el reporte
function generateReport() {
  generateBtn.classList.add('loading');
  generateBtn.disabled = true;
  
  // Simular el proceso de generación del reporte
  setTimeout(() => {
    generateBtn.classList.remove('loading');
    showSuccessModal();
  }, 2000);
}

// Función para mostrar el modal de éxito
function showSuccessModal() {
  successModal.classList.add('show');
}

// Función para cerrar el modal y simular descarga
function downloadReport() {
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const monthName = months[state.month - 1];
  
  console.log(`Descargando reporte: Reporte_${monthName}_${state.year}.pdf`);
  console.log('Propiedades:', state.selectedProperties);
  console.log('Contenido:', state.selectedContent);
  
  successModal.classList.remove('show');
  
  // Resetear el formulario
  state.selectedProperties = [];
  state.selectedContent = [];
  
  document.querySelectorAll('.property-item').forEach(item => {
    item.classList.remove('selected');
    item.querySelector('.custom-checkbox').classList.remove('checked');
  });
  
  document.querySelectorAll('.content-item .custom-checkbox').forEach(checkbox => {
    checkbox.classList.remove('checked');
  });
  
  updateGenerateButton();
}

// Función para manejar el botón de volver
function goBack() {
  console.log('Volviendo al Dashboard');
  // En una aplicación real, aquí se navegaría de vuelta
}

// Event Listeners para propiedades
propertyList.addEventListener('click', (e) => {
  const propertyItem = e.target.closest('.property-item');
  if (propertyItem) {
    toggleProperty(propertyItem);
  }
});

// Event Listeners para contenido
contentOptions.addEventListener('click', (e) => {
  const contentItem = e.target.closest('.content-item');
  if (contentItem) {
    toggleContent(contentItem);
  }
});

// Event Listener para generar reporte
generateBtn.addEventListener('click', generateReport);

// Event Listener para descargar reporte
downloadBtn.addEventListener('click', downloadReport);

// Event Listener para botón de volver
backButton.addEventListener('click', goBack);

// Event Listeners para los selectores de período
monthSelect.addEventListener('change', (e) => {
  state.month = parseInt(e.target.value);
});

yearSelect.addEventListener('change', (e) => {
  state.year = parseInt(e.target.value);
});

// Event Listener para cerrar modal al hacer clic fuera
successModal.addEventListener('click', (e) => {
  if (e.target === successModal) {
    successModal.classList.remove('show');
  }
});

// Event Listeners para botones de descarga del historial
document.querySelectorAll('.history-item .download-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const historyItem = e.target.closest('.history-item');
    const title = historyItem.querySelector('.history-title').textContent;
    console.log(`Descargando: ${title}`);
  });
});

// Inicializar el estado del botón
updateGenerateButton();
