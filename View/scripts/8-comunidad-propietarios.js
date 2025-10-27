document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadMembers();
});

let allContacts = [];
let filteredContacts = [];
let currentContact = null;

const searchInput = document.getElementById('searchInput');
const contactCardsContainer = document.querySelector('main');
const emptyState = document.getElementById('emptyState');
const modalOverlay = document.getElementById('modalOverlay');
const modalTitle = document.getElementById('modalTitle');
const messageText = document.getElementById('messageText');
const charCount = document.getElementById('charCount');
const successMessage = document.getElementById('successMessage');
const contactForm = document.getElementById('contactForm');

async function loadMembers() {
    contactCardsContainer.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    try {
        const response = await fetchWithAuth('/comunidad/miembros');
        if (response.ok) {
            allContacts = await response.json();
            filteredContacts = [...allContacts];
            renderContacts(filteredContacts);
        } else {
            contactCardsContainer.innerHTML = '<p>Error al cargar miembros.</p>';
        }
    } catch (error) {
        console.error('Error de red al cargar miembros:', error);
        contactCardsContainer.innerHTML = '<p>Error de conexión.</p>';
    }
}

function renderContacts(contacts) {
    contactCardsContainer.innerHTML = ''; // Limpiar antes de renderizar
    emptyState.classList.toggle('visible', contacts.length === 0);

    contacts.forEach(contact => {
        const card = document.createElement('article');
        card.className = 'contact-card';
        card.dataset.name = contact.nombre.toLowerCase();
        card.dataset.district = contact.distrito.toLowerCase();
        card.innerHTML = `
            <div class="avatar">...</div>
            <div class="contact-content">
                <div class="contact-header"><h4 class="contact-name">${contact.nombre}</h4></div>
                <p class="contact-location">📍 Propietario en ${contact.distrito}</p>
                <div class="tags">${contact.intereses.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>
                <button class="contact-button">Contactar</button>
            </div>
        `;
        card.querySelector('.contact-button').addEventListener('click', () => openModal(contact));
        contactCardsContainer.appendChild(card);
    });
}

function openModal(contact) {
    currentContact = contact;
    modalTitle.textContent = `Enviar mensaje a ${contact.nombre}`;
    modalOverlay.classList.add('active');
}

function closeModal() {
    modalOverlay.classList.remove('active');
    contactForm.reset();
    charCount.textContent = '0';
}

async function sendMessage(e) {
    e.preventDefault();
    const contenido = messageText.value.trim();
    if (!contenido) return;

    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;

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
            const err = await response.json();
            alert(`Error: ${err.message}`);
        }
    } catch (error) {
        alert('Error de conexión.');
    } finally {
        btn.disabled = false;
    }
}

searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    filteredContacts = allContacts.filter(c => 
        c.nombre.toLowerCase().includes(term) || 
        c.distrito.toLowerCase().includes(term)
    );
    renderContacts(filteredContacts);
});

contactForm.addEventListener('submit', sendMessage);
messageText.addEventListener('input', () => charCount.textContent = messageText.value.length);
document.querySelector('.close-button').addEventListener('click', closeModal);
modalOverlay.addEventListener('click', e => e.target === modalOverlay && closeModal());