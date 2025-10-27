document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadNotifications('todas');
    loadMarketAlert();
});

const notificationsList = document.getElementById('notificationsList');
const emptyState = document.getElementById('emptyState');
const popupOverlay = document.getElementById('popupOverlay');

async function loadNotifications(filter) {
    notificationsList.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    try {
        const response = await fetchWithAuth(`/notificaciones?filter=${filter}`);
        if (response.ok) {
            const notifications = await response.json();
            renderNotifications(notifications);
        }
    } catch (error) {
        notificationsList.innerHTML = '<p>Error al cargar notificaciones.</p>';
    }
}

function renderNotifications(notifications) {
    notificationsList.innerHTML = '';
    emptyState.classList.toggle('visible', notifications.length === 0);
    notificationsList.classList.toggle('hidden', notifications.length === 0);

    notifications.forEach(notif => {
        const item = document.createElement('div');
        item.className = `notification-item ${!notif.leida ? 'unread' : ''}`;
        item.dataset.type = notif.tipo;
        item.dataset.id = notif._id;
        item.innerHTML = `
            <div class="notification-icon ${notif.tipo}">...</div>
            <div class="notification-content">
                <div class="notification-title">${notif.titulo}</div>
                <p class="notification-message">${notif.mensaje}</p>
                <small class="notification-time">${new Date(notif.fecha).toLocaleString()}</small>
            </div>
            ${!notif.leida ? '<span class="unread-badge"></span>' : ''}
        `;
        item.addEventListener('click', () => toggleNotification(item));
        notificationsList.appendChild(item);
    });
}

async function toggleNotification(element) {
    element.classList.toggle('expanded');
    if (element.classList.contains('unread')) {
        const notifId = element.dataset.id;
        try {
            await fetchWithAuth(`/notificaciones/${notifId}/leer`, { method: 'PATCH' });
            element.classList.remove('unread');
            element.querySelector('.unread-badge')?.remove();
        } catch (error) {
            console.error('Error al marcar la notificación como leída:', error);
        }
    }
}

function filterNotifications(filter) {
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === filter);
    });
    loadNotifications(filter);
}

async function loadMarketAlert() {
    try {
        const response = await fetchWithAuth('/notificaciones/alertas-mercado');
        if (response.ok) {
            const alert = await response.json();
            if (alert) showPopup(alert);
        }
    } catch (error) {
        console.error('Error al cargar alerta de mercado:', error);
    }
}

function showPopup(alert) {
    popupOverlay.querySelector('h3').textContent = alert.titulo;
    popupOverlay.querySelector('p').textContent = alert.mensaje;
    popupOverlay.classList.add('active');
}

function closePopup() {
    popupOverlay.classList.remove('active');
}

function handleOpportunity() {
    closePopup();
    alert("Navegando a la página de edición de propiedad...");
}

document.querySelector('.back-button').addEventListener('click', () => window.history.back());