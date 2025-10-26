// Variables globales
const searchInput = document.getElementById("searchInput");
const contactCards = document.querySelectorAll(".contact-card");
const emptyState = document.getElementById("emptyState");
const modalOverlay = document.getElementById("modalOverlay");
const modalTitle = document.getElementById("modalTitle");
const messageText = document.getElementById("messageText");
const charCount = document.getElementById("charCount");
const successMessage = document.getElementById("successMessage");
const contactForm = document.getElementById("contactForm");

let currentContactName = "";

// Búsqueda en tiempo real
searchInput.addEventListener("input", function () {
  const searchTerm = this.value.toLowerCase().trim();
  let visibleCount = 0;

  contactCards.forEach((card) => {
    const name = card.getAttribute("data-name");
    const district = card.getAttribute("data-district");

    const matches =
      name.includes(searchTerm) || district.includes(searchTerm);

    if (matches) {
      card.classList.remove("hidden");
      visibleCount++;
    } else {
      card.classList.add("hidden");
    }
  });

  // Mostrar estado vacío si no hay resultados
  if (visibleCount === 0) {
    emptyState.classList.add("visible");
  } else {
    emptyState.classList.remove("visible");
  }
});

// Contador de caracteres
messageText.addEventListener("input", function () {
  charCount.textContent = this.value.length;
});

// Abrir modal
function openModal(name) {
  currentContactName = name;
  modalTitle.textContent = `Enviar mensaje a ${name}`;
  modalOverlay.classList.add("active");
  document.body.style.overflow = "hidden";
}

// Cerrar modal
function closeModal() {
  modalOverlay.classList.remove("active");
  document.body.style.overflow = "";

  // Resetear formulario después de la animación
  setTimeout(() => {
    contactForm.reset();
    charCount.textContent = "0";
  }, 300);
}

// Cerrar modal al hacer click en el overlay
modalOverlay.addEventListener("click", function (e) {
  if (e.target === modalOverlay) {
    closeModal();
  }
});

// Enviar mensaje
function sendMessage(e) {
  e.preventDefault();

  const message = messageText.value.trim();

  if (message) {
    // Cerrar modal
    closeModal();

    // Mostrar mensaje de éxito
    setTimeout(() => {
      successMessage.classList.add("show");

      // Ocultar después de 3 segundos
      setTimeout(() => {
        successMessage.classList.remove("show");
      }, 3000);
    }, 400);

    // Log para demostración (en producción esto enviaría a un servidor)
    console.log("Mensaje enviado a:", currentContactName);
    console.log("Contenido:", message);
  }
}

// Cerrar modal con tecla Escape
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape" && modalOverlay.classList.contains("active")) {
    closeModal();
  }
});

// Botón de volver
document
  .querySelector(".back-button")
  .addEventListener("click", function () {
    // En producción, esto navegaría al dashboard
    console.log("Volver al Dashboard");
    alert("Navegando al Dashboard...");
  });

// Botón de filtros
document
  .querySelector(".filter-button")
  .addEventListener("click", function () {
    // En producción, esto abriría un panel de filtros avanzados
    console.log("Abrir filtros");
    alert("Funcionalidad de filtros avanzados próximamente");
  });
