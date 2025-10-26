// Manejo de eventos interactivos
const notificationBtn = document.getElementById('notificationBtn');
const settingsBtn = document.getElementById('settingsBtn');
const addPropertyBtn = document.getElementById('addPropertyBtn');
const actionItems = document.querySelectorAll('.action-item');
const insightLink = document.querySelector('.insight-link');

// Notificaciones
notificationBtn.addEventListener('click', () => {
    alert('Centro de Notificaciones

• Propiedad con nueva consulta de inquilino
• Recordatorio: Pago pendiente
• Cambio de precio en mercado local');
});

// Configuración
settingsBtn.addEventListener('click', () => {
    alert('Acceso a Configuración

• Perfil de usuario
• Preferencias de privacidad
• Notificaciones');
});

// Agregar propiedad (FAB)
addPropertyBtn.addEventListener('click', () => {
    alert('Navegando a: Agregar Nueva Propiedad

Formulario para ingresar detalles de la propiedad.');
});

// Acciones rápidas
actionItems.forEach((item, index) => {
    item.addEventListener('click', () => {
        const actions = [
            'Navegando a: Mis Propiedades

Listado completo de tus inmuebles.',
            'Navegando a: Estimador de Precios

Tool para calcular el precio óptimo de alquiler.',
            'Generando: Reporte Mensual (PDF)

Resumen de ingresos y ocupación.'
        ];
        alert(actions[index]);
    });
});

// Enlace de insight
insightLink.addEventListener('click', (e) => {
    e.preventDefault();
    alert('Navegando a: Detalles de la Propiedad en Miraflores

Oportunidad de optimizar precio de alquiler.');
});

// Log de carga completada
window.addEventListener('load', () => {
    console.log('Dashboard PrediRent cargado exitosamente');
});
