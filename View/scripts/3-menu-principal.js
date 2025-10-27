document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupWelcomeMessage();
    // La carga de datos del dashboard ahora es parte del contador
    setupActivePropertiesCounter(); 
    setupEventListeners();
});

function setupWelcomeMessage() {
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.nombre) {
            document.getElementById('welcome-message').textContent = `¡Hola, ${user.nombre.split(' ')[0]}!`;
        }
    } catch (error) {
        console.error('Error al personalizar el saludo:', error);
    }
}

function setupEventListeners() {
    document.getElementById('notificationBtn').addEventListener('click', () => window.location.href = '7-notificaciones.html');
    document.getElementById('settingsBtn').addEventListener('click', () => alert('Acceso a Configuración (Próximamente)'));
    document.getElementById('addPropertyBtn').addEventListener('click', () => window.location.href = '4-registrar-propiedad.html');

    // La navegación del contador se maneja en setupActivePropertiesCounter
    document.querySelectorAll('.action-item').forEach(item => {
        const text = item.querySelector('.action-text')?.textContent || '';
        if (text.includes('Estimar')) item.addEventListener('click', () => window.location.href = '9-estimar-precio.html');
        if (text.includes('Reporte')) item.addEventListener('click', () => window.location.href = '5-generar-reportes.html');
    });
}

function setupActivePropertiesCounter() {
    const badge = document.getElementById('activePropertiesCountBadge');
    const container = badge.closest('.action-item');
    if (!badge || !container) return;

    const fetchCount = async () => {
        try {
            badge.textContent = '...';
            badge.classList.remove('retry');
            badge.title = 'Cargando...';

            const response = await fetchWithAuth('/api/propiedades/activas/count');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const { data } = await response.json();
            updateBadge(data.count);

        } catch (error) {
            console.error("Error al obtener contador de propiedades:", error);
            updateBadge('!', 'No se pudo cargar. Clic para reintentar.');
        }
    };

    const updateBadge = (count, title = 'Propiedades Activas') => {
        badge.textContent = count;
        badge.title = title;
        if (count === '!') {
            badge.classList.add('retry');
            badge.onclick = (e) => { e.stopPropagation(); fetchCount(); };
        } else {
            badge.onclick = null;
        }
    };

    container.addEventListener('click', (e) => {
        // Solo navegar si el clic no fue en el botón de reintento
        if (!e.target.classList.contains('retry')) {
            window.location.href = '9-estimar-precio.html';
        }
    });

    fetchCount();
    setInterval(fetchCount, 60000);
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') fetchCount();
    });
}