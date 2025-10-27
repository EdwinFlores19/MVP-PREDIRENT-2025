document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadMembers();
});

let allContacts = [];
let filteredContacts = [];
let currentContact = null;

const searchInput = document.getElementById('searchInput');
const contactsList = document.getElementById('contactsList');
const noResults = document.getElementById('noResults');
const resultsCount = document.getElementById('resultsCount');
const modalOverlay = document.getElementById('modalOverlay');
const modalTitle = document.getElementById('modalTitle');
const messageText = document.getElementById('messageText');
const charCount = document.getElementById('charCount');
const btnSend = document.getElementById('btnSend');
const successMessage = document.getElementById('successMessage');

async function loadMembers(filters = '') {
    contactsList.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    try {
        const response = await fetchWithAuth(`/comunidad/miembros${filters}`);
        if (response.ok) {
            allContacts = await response.json();
            filteredContacts = [...allContacts];
            renderContacts(filteredContacts);
        }
    } catch (error) {
        console.error('Error al cargar miembros:', error);
        contactsList.innerHTML = '<p>Error al cargar los miembros.</p>';
    }
}

function renderContacts(contacts) {
    contactsList.innerHTML = '';
    resultsCount.textContent = `${contacts.length} personas`;
    noResults.classList.toggle('visible', contacts.length === 0);

    contacts.forEach(contact => {
        const card = document.createElement('article');
        card.className = 'contact-card';
        card.innerHTML = `
            <div class="contact-header">
                <div class="contact-avatar">...</div>
                <div class="contact-info">
                    <h4 class="contact-name">${contact.nombre} ${contact.verificado ? '<div class="verified-badge">...</div>' : ''}</h4>
                    <p class="contact-location">📍 Propietario en ${contact.distrito}</p>
                    <div class="contact-meta">...</div>
                </div>
            </div>
            <div class="interests">${contact.intereses.map(i => `<span class="interest-tag">${i}</span>`).join('')}</div>
            <div class="contact-actions">
                <button class="btn-contact">Contactar</button>
                <button class="btn-view-profile">Ver Perfil</button>
            </div>
        `;
        card.querySelector('.btn-contact').addEventListener('click', () => openModal(contact));
        contactsList.appendChild(card);
    });
}

function openModal(contact) {
    currentContact = contact;
    modalTitle.textContent = `Enviar mensaje a ${contact.nombre}`;
    modalOverlay.classList.add('active');
}

function closeModal() {
    modalOverlay.classList.remove('active');
    messageText.value = '';
    charCount.textContent = '0';
}

async function sendMessage() {
    const contenido = messageText.value.trim();
    if (!contenido) return;

    btnSend.disabled = true;
    btnSend.textContent = 'Enviando...';

    try {
        const response = await fetchWithAuth('/comunidad/mensaje', {
            method: 'POST',
            body: JSON.stringify({ destinatarioID: currentContact._id, contenido })
        });

        if (response.ok) {
            closeModal();
            successMessage.classList.add('show');
            setTimeout(() => successMessage.classList.remove('show'), 3000);
        } else {
            const error = await response.json();
            alert(`Error: ${error.message}`);
        }
    } catch (error) {
        alert('Error de conexión al enviar el mensaje.');
    } finally {
        btnSend.disabled = false;
        btnSend.textContent = 'Enviar';
    }
}

searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.toLowerCase();
    filteredContacts = allContacts.filter(c => c.nombre.toLowerCase().includes(searchTerm) || c.distrito.toLowerCase().includes(searchTerm));
    renderContacts(filteredContacts);
});

// Event listeners para modales y botones
document.getElementById('btnCancel').addEventListener('click', closeModal);
btnSend.addEventListener('click', sendMessage);
messageText.addEventListener('input', () => charCount.textContent = messageText.value.length);