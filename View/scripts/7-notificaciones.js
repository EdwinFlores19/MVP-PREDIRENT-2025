// Variables globales
const popupOverlay = document.getElementById("popupOverlay");
const notificationsList = document.getElementById("notificationsList");
const emptyState = document.getElementById("emptyState");
const allNotifications = document.querySelectorAll(".notification-item");
const tabButtons = document.querySelectorAll(".tab-button");

let currentFilter = "todas";

// Mostrar popup automáticamente después de 2 segundos (demo)
setTimeout(() => {
  showPopup();
}, 2000);

// Funciones del Popup
function showPopup() {
  popupOverlay.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closePopup() {
  popupOverlay.classList.remove("active");
  document.body.style.overflow = "";
}

function handleOpportunity() {
  closePopup();
  alert("Navegando a la página de edición de propiedad...");
  console.log("Acción: Ver oportunidad de mercado");
}

// Cerrar popup al hacer clic en el overlay
popupOverlay.addEventListener("click", function (e) {
  if (e.target === popupOverlay) {
    closePopup();
  }
});

// Cerrar popup con tecla Escape
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape" && popupOverlay.classList.contains("active")) {
    closePopup();
  }
});

// Funciones de Notificaciones
function toggleNotification(element) {
  // Expandir/contraer notificación
  element.classList.toggle("expanded");

  // Marcar como leída
  if (element.classList.contains("unread")) {
    element.classList.remove("unread");
    const badge = element.querySelector(".unread-badge");
    if (badge) {
      badge.style.transform = "scale(0)";
      setTimeout(() => badge.remove(), 200);
    }
  }
}

function filterNotifications(filter) {
  currentFilter = filter;

  // Actualizar tabs
  tabButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.filter === filter);
  });

  // Filtrar notificaciones
  let visibleCount = 0;

  allNotifications.forEach((notification) => {
    const type = notification.dataset.type;
    const shouldShow = filter === "todas" || type === filter;

    notification.classList.toggle("hidden", !shouldShow);
    if (shouldShow) visibleCount++;
  });

  // Mostrar estado vacío si no hay resultados
  if (visibleCount === 0) {
    notificationsList.classList.add("hidden");
    emptyState.classList.add("visible");
  } else {
    notificationsList.classList.remove("hidden");
    emptyState.classList.remove("visible");
  }
}

function goBack() {
  console.log("Volver al Dashboard");
  alert("Navegando al Dashboard...");
}

// Marcar todas como leídas (función auxiliar)
function markAllAsRead() {
  allNotifications.forEach((notification) => {
    if (notification.classList.contains("unread")) {
      notification.classList.remove("unread");
      const badge = notification.querySelector(".unread-badge");
      if (badge) badge.remove();
    }
  });
}
