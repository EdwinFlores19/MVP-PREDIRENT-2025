// ============================================
// DATOS DE CONTACTOS (Simulados)
// ============================================
const contactsData = [
  {
    id: 1,
    name: 'Edwin R.',
    district: 'Surco',
    interests: ['Mantenimiento', 'Legal', 'Optimización'],
    properties: 3,
    responseTime: '~2h',
    verified: true,
    online: true
  },
  {
    id: 2,
    name: 'María S.',
    district: 'Miraflores',
    interests: ['Marketing', 'Finanzas'],
    properties: 5,
    responseTime: '~1h',
    verified: true,
    online: true
  },
  {
    id: 3,
    name: 'Carlos T.',
    district: 'San Isidro',
    interests: ['Legal', 'Finanzas', 'Optimización'],
    properties: 2,
    responseTime: '~4h',
    verified: true,
    online: false
  },
  {
    id: 4,
    name: 'Ana L.',
    district: 'La Molina',
    interests: ['Mantenimiento', 'Marketing'],
    properties: 4,
    responseTime: '~3h',
    verified: false,
    online: true
  },
  {
    id: 5,
    name: 'Jorge M.',
    district: 'Surco',
    interests: ['Legal', 'Marketing', 'Finanzas'],
    properties: 6,
    responseTime: '~1h',
    verified: true,
    online: false
  },
  {
    id: 6,
    name: 'Patricia V.',
    district: 'Barranco',
    interests: ['Optimización', 'Marketing', 'Seguridad'],
    properties: 3,
    responseTime: '~5h',
    verified: true,
    online: true
  },
  {
    id: 7,
    name: 'Roberto C.',
    district: 'Miraflores',
    interests: ['Mantenimiento', 'Legal', 'Seguridad'],
    properties: 4,
    responseTime: '~2h',
    verified: false,
    online: false
  },
  {
    id: 8,
    name: 'Lucía P.',
    district: 'San Isidro',
    interests: ['Finanzas', 'Optimización'],
    properties: 7,
    responseTime: '~30m',
    verified: true,
    online: true
  }
];

// ============================================
// VARIABLES GLOBALES
// ============================================
let filteredContacts = [...contactsData];
let currentContactName = '';
let activeDistrictFilters = [];
let activeInterestFilters = [];
let activeQuickFilter = 'todos';

// ============================================
// ELEMENTOS DEL DOM
// ============================================
const searchInput = document.getElementById('searchInput');
const contactsList = document.getElementById('contactsList');
const noResults = document.getElementById('noResults');
const resultsCount = document.getElementById('resultsCount');
const modalOverlay = document.getElementById('modalOverlay');
const modalTitle = document.getElementById('modalTitle');
const messageText = document.getElementById('messageText');
const charCount = document.getElementById('charCount');
const btnCancel = document.getElementById('btnCancel');
const btnSend = document.getElementById('btnSend');
const successMessage = document.getElementById('successMessage');
const btnFilter = document.getElementById('btnFilter');
const filterBadge = document.getElementById('filterBadge');
const filtersPanel = document.getElementById('filtersPanel');
const filtersOverlay = document.getElementById('filtersOverlay');
const btnCloseFilters = document.getElementById('btnCloseFilters');
const btnApplyFilters = document.getElementById('btnApplyFilters');
const btnClearFilters = document.getElementById('btnClearFilters');
const btnClearSearch = document.getElementById('btnClearSearch');
const districtFilters = document.getElementById('districtFilters');
const interestFilters = document.getElementById('interestFilters');
const districtCount = document.getElementById('districtCount');
const interestCount = document.getElementById('interestCount');

// ============================================
// FUNCIÓN: RENDERIZAR CONTACTOS
// ============================================
function renderContacts(contacts) {
  contactsList.innerHTML = '';

  if (contacts.length === 0) {
    noResults.classList.add('visible');
    resultsCount.textContent = '0 personas';
    return;
  }

  noResults.classList.remove('visible');
  resultsCount.textContent = `${contacts.length} ${contacts.length === 1 ? 'persona' : 'personas'}`;

  contacts.forEach(contact => {
    const card = document.createElement('article');
    card.className = 'contact-card';
    card.setAttribute('data-district', contact.district);
    card.setAttribute('data-interests', contact.interests.join(','));

    const interestsTags = contact.interests
      .map(interest => {
        const icons = {
          'Mantenimiento': '🔧',
          'Legal': '⚖️',
          'Optimización': '📊',
          'Marketing': '📱',
          'Finanzas': '💰',
          'Seguridad': '🔒'
        };
        return `<span class="interest-tag">${icons[interest] || '•'} ${interest}</span>`;
      })
      .join('');

    const verifiedBadge = contact.verified ? `
      <div class="verified-badge">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
          <path d="M20 6L9 17L4 12" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
    ` : '';

    const onlineBadge = contact.online ? '<div class="avatar-badge"></div>' : '';

    card.innerHTML = `
      <div class="contact-header">
        <div class="contact-avatar">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
            <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="12" cy="7" r="4" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          ${onlineBadge}
        </div>
        <div class="contact-info">
          <h4 class="contact-name">
            ${contact.name}
            ${verifiedBadge}
          </h4>
          <p class="contact-location">📍 Propietario en ${contact.district}</p>
          <div class="contact-meta">
            <span class="meta-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              ${contact.properties} prop.
            </span>
            <span class="meta-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <path d="M12 6V12L16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              ${contact.responseTime}
            </span>
          </div>
        </div>
      </div>
      <div class="interests">
        ${interestsTags}
      </div>
      <div class="contact-actions">
        <button class="btn-contact" data-name="${contact.name}">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Contactar
        </button>
        <button class="btn-view-profile" data-name="${contact.name}">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
            <path d="M12 5C8.24261 5 5.43602 7.44125 3.76737 9.43966C2.85009 10.5417 2.39145 11.0928 2.39145 12C2.39145 12.9072 2.85009 13.4583 3.76737 14.5603C5.43602 16.5587 8.24261 19 12 19C15.7574 19 18.564 16.5587 20.2326 14.5603C21.1499 13.4583 21.6085 12.9072 21.6085 12C21.6085 11.0928 21.1499 10.5417 20.2326 9.43966C18.564 7.44125 15.7574 5 12 5Z" stroke="currentColor" stroke-width="2"/>
          </svg>
        </button>
      </div>
    `;

    contactsList.appendChild(card);
  });

  // Event listeners para botones de contactar
  const btnContacts = document.querySelectorAll('.btn-contact');
  btnContacts.forEach(btn => {
    btn.addEventListener('click', (e) => {
      currentContactName = e.target.closest('.btn-contact').getAttribute('data-name');
      openModal();
    });
  });

  // Event listeners para ver perfil
  const btnProfiles = document.querySelectorAll('.btn-view-profile');
  btnProfiles.forEach(btn => {
    btn.addEventListener('click', () => {
      alert('Función de ver perfil completo próximamente');
    });
  });
}

// ============================================
// FUNCIÓN: FILTRAR CONTACTOS
// ============================================
function filterContacts() {
  const searchTerm = searchInput.value.toLowerCase().trim();
  
  filteredContacts = contactsData.filter(contact => {
    // Filtro de búsqueda
    const matchesSearch = 
      contact.name.toLowerCase().includes(searchTerm) ||
      contact.district.toLowerCase().includes(searchTerm) ||
      contact.interests.some(i => i.toLowerCase().includes(searchTerm));

    // Filtro de distrito
    const matchesDistrict = 
      activeDistrictFilters.length === 0 || 
      activeDistrictFilters.includes(contact.district);

    // Filtro de intereses
    const matchesInterest = 
      activeInterestFilters.length === 0 ||
      activeInterestFilters.some(interest => contact.interests.includes(interest));

    // Filtros rápidos
    let matchesQuickFilter = true;
    if (activeQuickFilter === 'verificados') {
      matchesQuickFilter = contact.verified;
    } else if (activeQuickFilter === 'activos') {
      matchesQuickFilter = contact.online;
    } else if (activeQuickFilter === 'nuevos') {
      matchesQuickFilter = contact.id >= 6; // Los últimos 3
    }

    return matchesSearch && matchesDistrict && matchesInterest && matchesQuickFilter;
  });

  renderContacts(filteredContacts);
  updateFilterBadge();
}

// ============================================
// FUNCIÓN: ACTUALIZAR BADGE DE FILTROS
// ============================================
function updateFilterBadge() {
  const totalFilters = activeDistrictFilters.length + activeInterestFilters.length;
  filterBadge.textContent = totalFilters;
  
  if (totalFilters > 0) {
    filterBadge.classList.add('active');
    btnFilter.classList.add('active');
  } else {
    filterBadge.classList.remove('active');
    if (!filtersPanel.classList.contains('active')) {
      btnFilter.classList.remove('active');
    }
  }

  // Actualizar contadores en el panel
  if (activeDistrictFilters.length > 0) {
    districtCount.style.display = 'block';
    districtCount.textContent = activeDistrictFilters.length;
  } else {
    districtCount.style.display = 'none';
  }

  if (activeInterestFilters.length > 0) {
    interestCount.style.display = 'block';
    interestCount.textContent = activeInterestFilters.length;
  } else {
    interestCount.style.display = 'none';
  }
}

// ============================================
// FUNCIÓN: ABRIR MODAL
// ============================================
function openModal() {
  modalTitle.textContent = `Enviar mensaje a ${currentContactName}`;
  messageText.value = '';
  charCount.textContent = '0';
  modalOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

// ============================================
// FUNCIÓN: CERRAR MODAL
// ============================================
function closeModal() {
  modalOverlay.classList.remove('active');
  document.body.style.overflow = 'auto';
}

// ============================================
// FUNCIÓN: ENVIAR MENSAJE
// ============================================
function sendMessage() {
  const message = messageText.value.trim();
  
  if (message === '') {
    messageText.style.borderColor = var(--naranja-principal);
    messageText.focus();
    setTimeout(() => {
      messageText.style.borderColor = '';
    }, 2000);
    return;
  }

  closeModal();

  successMessage.classList.add('show');
  
  setTimeout(() => {
    successMessage.classList.remove('show');
  }, 3500);

  messageText.value = '';
  charCount.textContent = '0';
}

// ============================================
// FUNCIÓN: ABRIR/CERRAR PANEL DE FILTROS
// ============================================
function openFiltersPanel() {
  filtersPanel.classList.add('active');
  filtersOverlay.classList.add('active');
  btnFilter.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeFiltersPanel() {
  filtersPanel.classList.remove('active');
  filtersOverlay.classList.remove('active');
  if (activeDistrictFilters.length === 0 && activeInterestFilters.length === 0) {
    btnFilter.classList.remove('active');
  }
  document.body.style.overflow = 'auto';
}

// ============================================
// FUNCIÓN: APLICAR FILTROS
// ============================================
function applyFilters() {
  filterContacts();
  closeFiltersPanel();
}

// ============================================
// FUNCIÓN: LIMPIAR FILTROS
// ============================================
function clearAllFilters() {
  activeDistrictFilters = [];
  activeInterestFilters = [];
  
  document.querySelectorAll('.filter-option.active').forEach(option => {
    option.classList.remove('active');
  });
  
  updateFilterBadge();
  filterContacts();
}

// ============================================
// FUNCIÓN: LIMPIAR BÚSQUEDA
// ============================================
function clearSearch() {
  searchInput.value = '';
  activeQuickFilter = 'todos';
  document.querySelectorAll('.quick-filter-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.getAttribute('data-quick') === 'todos') {
      btn.classList.add('active');
    }
  });
  clearAllFilters();
}

// ============================================
// EVENT LISTENERS
// ============================================

// Búsqueda en tiempo real
searchInput.addEventListener('input', filterContacts);

// Contador de caracteres
messageText.addEventListener('input', () => {
  charCount.textContent = messageText.value.length;
});

// Botón de filtros
btnFilter.addEventListener('click', openFiltersPanel);
btnCloseFilters.addEventListener('click', closeFiltersPanel);
btnApplyFilters.addEventListener('click', applyFilters);
btnClearFilters.addEventListener('click', clearAllFilters);
btnClearSearch.addEventListener('click', clearSearch);

// Overlay de filtros
filtersOverlay.addEventListener('click', closeFiltersPanel);

// Filtros rápidos
document.querySelectorAll('.quick-filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.quick-filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeQuickFilter = btn.getAttribute('data-quick');
    filterContacts();
  });
});

// Filtros de distrito
districtFilters.addEventListener('click', (e) => {
  if (e.target.classList.contains('filter-option')) {
    const district = e.target.getAttribute('data-district');
    e.target.classList.toggle('active');
    
    if (activeDistrictFilters.includes(district)) {
      activeDistrictFilters = activeDistrictFilters.filter(d => d !== district);
    } else {
      activeDistrictFilters.push(district);
    }
    
    updateFilterBadge();
  }
});

// Filtros de intereses
interestFilters.addEventListener('click', (e) => {
  if (e.target.classList.contains('filter-option')) {
    const interest = e.target.getAttribute('data-interest');
    e.target.classList.toggle('active');
    
    if (activeInterestFilters.includes(interest)) {
      activeInterestFilters = activeInterestFilters.filter(i => i !== interest);
    } else {
      activeInterestFilters.push(interest);
    }
    
    updateFilterBadge();
  }
});

// Mensajes rápidos en el modal
document.querySelectorAll('.quick-message-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    messageText.value = btn.getAttribute('data-message');
    charCount.textContent = messageText.value.length;
    messageText.focus();
  });
});

// Modal - Botón cancelar
btnCancel.addEventListener('click', closeModal);

// Modal - Botón enviar
btnSend.addEventListener('click', sendMessage);

// Cerrar modal al hacer clic fuera del contenido
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) {
    closeModal();
  }
});

// Botón volver
document.querySelector('.btn-back').addEventListener('click', () => {
  // Simulación de navegación
  if (confirm('¿Deseas volver al Dashboard?')) {
    alert('Redirigiendo al Dashboard...');
  }
});

// Limpiar estilo de error del textarea
messageText.addEventListener('focus', () => {
  messageText.style.borderColor = '';
});

// Prevenir scroll del body cuando los paneles están abiertos
let touchStartY = 0;

filtersPanel.addEventListener('touchstart', (e) => {
  touchStartY = e.touches[0].clientY;
});

filtersPanel.addEventListener('touchmove', (e) => {
  const touchY = e.touches[0].clientY;
  const isScrollingDown = touchY < touchStartY;
  const isAtTop = filtersPanel.scrollTop === 0;
  
  if (isAtTop && !isScrollingDown) {
    e.preventDefault();
  }
}, { passive: false });

// ============================================
// FUNCIONES DE ANIMACIÓN
// ============================================

// Animación suave al cargar
window.addEventListener('load', () => {
  document.body.style.opacity = '0';
  setTimeout(() => {
    document.body.style.transition = 'opacity 0.3s ease';
    document.body.style.opacity = '1';
  }, 50);
});

// Efecto parallax suave en el scroll
let lastScrollTop = 0;
const header = document.querySelector('header');

window.addEventListener('scroll', () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  
  if (scrollTop > lastScrollTop && scrollTop > 100) {
    // Scrolling down
    header.style.transform = 'translateX(-50%) translateY(-10px)';
    header.style.opacity = '0.95';
  } else {
    // Scrolling up
    header.style.transform = 'translateX(-50%) translateY(0)';
    header.style.opacity = '1';
  }
  
  lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
}, { passive: true });

// ============================================
// GESTOS TÁCTILES PARA CERRAR PANEL
// ============================================
let touchStartYPanel = 0;
let isDragging = false;

filtersPanel.addEventListener('touchstart', (e) => {
  if (e.target.classList.contains('filters-handle') || 
      e.target.classList.contains('filters-header')) {
    touchStartYPanel = e.touches[0].clientY;
    isDragging = true;
  }
});

filtersPanel.addEventListener('touchmove', (e) => {
  if (!isDragging) return;
  
  const touchY = e.touches[0].clientY;
  const deltaY = touchY - touchStartYPanel;
  
  if (deltaY > 0) {
    filtersPanel.style.transform = `translateX(-50%) translateY(${deltaY}px)`;
  }
});

filtersPanel.addEventListener('touchend', (e) => {
  if (!isDragging) return;
  
  const touchY = e.changedTouches[0].clientY;
  const deltaY = touchY - touchStartYPanel;
  
  if (deltaY > 100) {
    closeFiltersPanel();
  }
  
  filtersPanel.style.transform = 'translateX(-50%) translateY(0)';
  isDragging = false;
});

// ============================================
// SIMULACIÓN DE ACTUALIZACIONES EN TIEMPO REAL
// ============================================

// Simular cambios en estadísticas cada 30 segundos
setInterval(() => {
  const statNumbers = document.querySelectorAll('.stat-number');
  statNumbers.forEach((stat, index) => {
    if (index === 1) { // Solo actualizar "En línea"
      const currentValue = parseInt(stat.textContent);
      const change = Math.floor(Math.random() * 5) - 2; // -2 a +2
      const newValue = Math.max(80, Math.min(95, currentValue + change));
      
      // Animación de cambio
      stat.style.transform = 'scale(1.1)';
      stat.style.color = change > 0 ? '#93C47D' : change < 0 ? '#FF7B54' : 'white';
      
      setTimeout(() => {
        stat.textContent = newValue;
        setTimeout(() => {
          stat.style.transform = 'scale(1)';
          stat.style.color = 'white';
        }, 200);
      }, 150);
    }
  });
}, 30000);

// ============================================
// NOTIFICACIONES SIMULADAS
// ============================================

// Simular notificación de nuevo miembro cada 2 minutos
setInterval(() => {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 160px;
    left: 50%;
    transform: translateX(-50%) translateY(-100px);
    background: white;
    padding: 12px 20px;
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    z-index: 999;
    font-size: 13px;
    color: #333;
    opacity: 0;
    transition: all 0.4s ease;
    max-width: 90%;
    display: flex;
    align-items: center;
    gap: 10px;
    border-left: 4px solid #93C47D;
  `;
  
  notification.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="#93C47D" stroke-width="2" stroke-linecap="round"/>
      <circle cx="9" cy="7" r="4" stroke="#93C47D" stroke-width="2"/>
      <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="#93C47D" stroke-width="2" stroke-linecap="round"/>
      <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45768C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="#93C47D" stroke-width="2" stroke-linecap="round"/>
    </svg>
    <span><strong>Nuevo miembro</strong> se unió a la comunidad</span>
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.transform = 'translateX(-50%) translateY(0)';
    notification.style.opacity = '1';
  }, 100);
  
  setTimeout(() => {
    notification.style.transform = 'translateX(-50%) translateY(-100px)';
    notification.style.opacity = '0';
    setTimeout(() => notification.remove(), 400);
  }, 4000);
}, 120000); // Cada 2 minutos

// ============================================
// INDICADOR DE CONECTIVIDAD
// ============================================

window.addEventListener('online', () => {
  const connectivity = document.createElement('div');
  connectivity.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, #93C47D 0%, #6B8E23 100%);
    color: white;
    padding: 12px 24px;
    border-radius: 12px;
    font-size: 13px;
    font-weight: 600;
    box-shadow: 0 4px 16px rgba(147, 196, 125, 0.4);
    z-index: 2000;
  `;
  connectivity.textContent = '✓ Conectado';
  document.body.appendChild(connectivity);
  
  setTimeout(() => connectivity.remove(), 3000);
});

window.addEventListener('offline', () => {
  const connectivity = document.createElement('div');
  connectivity.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, #FF7B54 0%, #E66B44 100%);
    color: white;
    padding: 12px 24px;
    border-radius: 12px;
    font-size: 13px;
    font-weight: 600;
    box-shadow: 0 4px 16px rgba(255, 123, 84, 0.4);
    z-index: 2000;
  `;
  connectivity.textContent = '⚠ Sin conexión';
  document.body.appendChild(connectivity);
});

// ============================================
// INICIALIZACIÓN
// ============================================

// Renderizar contactos iniciales
renderContacts(contactsData);

// Mostrar mensaje de bienvenida
setTimeout(() => {
  const welcome = document.createElement('div');
  welcome.style.cssText = `
    position: fixed;
    top: 160px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, #FF7B54 0%, #FFB26B 100%);
    color: white;
    padding: 14px 24px;
    border-radius: 14px;
    font-size: 14px;
    font-weight: 600;
    box-shadow: 0 4px 16px rgba(255, 123, 84, 0.3);
    z-index: 998;
    opacity: 0;
    transition: all 0.4s ease;
    max-width: 90%;
    text-align: center;
  `;
  welcome.textContent = '¡Bienvenido a la Comunidad! 👋';
  document.body.appendChild(welcome);
  
  setTimeout(() => {
    welcome.style.opacity = '1';
  }, 500);
  
  setTimeout(() => {
    welcome.style.opacity = '0';
    setTimeout(() => welcome.remove(), 400);
  }, 3500);
}, 1000);

// Aplicar transiciones suaves a las tarjetas al aparecer
setTimeout(() => {
  const cards = document.querySelectorAll('.contact-card');
  cards.forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
      card.style.transition = 'all 0.4s ease';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, index * 50);
  });
}, 500);

// Efecto de pulsación en estadísticas
document.querySelectorAll('.stat-card').forEach(card => {
  card.addEventListener('click', () => {
    card.style.transform = 'scale(0.95)';
    setTimeout(() => {
      card.style.transform = 'scale(1)';
    }, 150);
  });
});

// Log de inicialización
console.log('%c🏠 PrediRent - Comunidad de Propietarios', 'color: #FF7B54; font-size: 16px; font-weight: bold;');
console.log('%cVista cargada correctamente ✓', 'color: #93C47D; font-size: 12px;');
console.log(`%c${contactsData.length} propietarios disponibles`, 'color: #777; font-size: 12px;');
