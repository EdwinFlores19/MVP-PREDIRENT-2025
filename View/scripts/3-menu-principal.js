let userPropertiesCount = 0;

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupWelcomeMessage();
    loadDashboardData();
    setupEventListeners();
});

function setupWelcomeMessage() {
    try {
        const userString = localStorage.getItem('user');
        if (userString) {
            const user = JSON.parse(userString);
            if (user && user.nombre) {
                const firstName = user.nombre.split(' ')[0];
                document.getElementById('welcome-message').textContent = `¡Hola, ${firstName}!`;
            }
        }
    } catch (error) {
        console.error('Error al personalizar el saludo:', error);
    }
}

async function loadDashboardData() {
    showLoadingState(true);
    try {
        const [propertiesRes, insightsRes] = await Promise.all([
            fetchWithAuth('/propiedades/mis-propiedades'),
            fetchWithAuth('/notificaciones?filter=alertas&limit=1')
        ]);

        if (propertiesRes.ok) {
            const data = await propertiesRes.json();
            userPropertiesCount = data.totalPropiedades || 0;
            updateSummaryCards(data);
        }

        if (insightsRes.ok) {
            const insights = await insightsRes.json();
            updateInsightBanner(insights[0]);
        }
    } catch (error) {
        console.error('Error al cargar datos del dashboard:', error);
    } finally {
        showLoadingState(false);
    }
}

function updateSummaryCards(data) {
    const { totalPropiedades, ingresosMes, tasaOcupacion, comparativoMesAnterior } = data;
    document.querySelector('.summary-cards .card:nth-child(1) .card-value').textContent = totalPropiedades || 0;
    const ingresosEl = document.querySelector('.summary-cards .card:nth-child(2) .card-value span');
    if (ingresosEl) ingresosEl.textContent = (ingresosMes || 0).toLocaleString('es-PE');
    const comparativoEl = document.querySelector('.summary-cards .card:nth-child(2) .card-subtitle');
    if (comparativoEl) comparativoEl.textContent = `${comparativoMesAnterior >= 0 ? '+' : ''}${comparativoMesAnterior}% vs mes anterior`;
    const tasaOcupacionEl = document.querySelector('.summary-cards .card:nth-child(3) .card-value');
    if (tasaOcupacionEl) tasaOcupacionEl.textContent = `${tasaOcupacion || 0}%`;
    const donutChart = document.querySelector('.donut-chart circle:last-child');
    if (donutChart) {
        const circumference = 2 * Math.PI * 40;
        const offset = circumference - (tasaOcupacion / 100) * circumference;
        donutChart.style.strokeDasharray = `${circumference - offset} ${offset}`;
    }
}

function updateInsightBanner(insight) {
    const insightBanner = document.querySelector('.insight-banner');
    if (!insight || !insightBanner) return;
    insightBanner.querySelector('p').textContent = insight.mensaje;
    const insightLink = insightBanner.querySelector('.insight-link');
    insightLink.textContent = 'Revisar propiedad';
    insightLink.addEventListener('click', (e) => {
        e.preventDefault();
        if (userPropertiesCount === 0) {
            window.location.href = '4-registrar-propiedad.html';
        } else {
            // Aquí iría la lógica para ir a la propiedad específica del insight
            alert('Navegando a la propiedad específica del insight...');
        }
    });
    insightBanner.style.display = 'flex';
}

function showLoadingState(isLoading) {
    const cards = document.querySelectorAll('.card, .insight-banner');
    cards.forEach(card => {
        card.style.opacity = isLoading ? '0.5' : '1';
    });
}

function setupEventListeners() {
    document.getElementById('notificationBtn').addEventListener('click', () => window.location.href = '7-notificaciones.html');
    document.getElementById('settingsBtn').addEventListener('click', () => alert('Acceso a Configuración (Próximamente)'));
    document.getElementById('addPropertyBtn').addEventListener('click', () => window.location.href = '4-registrar-propiedad.html');

    document.querySelectorAll('.action-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const text = e.currentTarget.querySelector('.action-text').textContent;
            if (text.includes('Propiedades')) {
                if (userPropertiesCount === 0) {
                    window.location.href = '4-registrar-propiedad.html';
                } else {
                    alert('Navegando a la lista de propiedades...');
                    // window.location.href = 'mis-propiedades.html'; // Futura implementación
                }
            }
            if (text.includes('Estimar')) window.location.href = '9-estimar-precio.html';
            if (text.includes('Reporte')) window.location.href = '5-generar-reportes.html';
        });
    });
}