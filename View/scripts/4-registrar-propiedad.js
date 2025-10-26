const form = document.getElementById('propertyForm');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const backBtn = document.getElementById('backBtn');
const nextBtn = document.getElementById('nextBtn');
const closeBtn = document.getElementById('closeBtn');
const successMessage = document.getElementById('successMessage');

let currentStep = 1;
const totalSteps = 5;

const formData = {
    propertyType: '',
    accommodation: '',
    metrage: '',
    bedrooms: 1,
    bathrooms: 1,
    amenities: [],
    highlights: [],
    security: [],
    title: '',
    description: '',
    aspects: [],
    district: '',
    address: '',
    postal: ''
};

function updateProgress() {
    const percentage = (currentStep / totalSteps) * 100;
    progressFill.style.width = percentage + '%';
    const titles = ['Tipo de Espacio', 'Datos Básicos', 'Descripción', 'Ubicación', 'Verificación'];
    progressText.textContent = `Paso ${currentStep} de ${totalSteps}: ${titles[currentStep - 1]}`;
}

function showStep(step) {
    document.querySelectorAll('fieldset').forEach(fs => fs.classList.remove('active'));
    document.querySelector(`fieldset[data-step="${step}"]`).classList.add('active');
    backBtn.classList.toggle('show', step > 1);
    const btnTexts = ['Siguiente', 'Siguiente', 'Siguiente', 'Siguiente', 'Finalizar'];
    nextBtn.textContent = btnTexts[step - 1];
    updateProgress();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function validateStep(step) {
    const errors = {};

    if (step === 1) {
        if (!formData.propertyType) errors.propertyType = 'Selecciona un tipo de propiedad';
        if (!formData.accommodation) errors.accommodation = 'Selecciona un tipo de alojamiento';
    } else if (step === 2) {
        if (!document.getElementById('metrageInput').value) errors.metrage = 'Ingresa el metraje';
        if (formData.highlights.length === 0) errors.highlights = 'Selecciona al menos una comodidad destacada';
    } else if (step === 3) {
        if (!document.getElementById('titleInput').value.trim()) errors.title = 'Ingresa un título';
        if (!document.getElementById('descriptionInput').value.trim()) errors.description = 'Describe tu propiedad';
        if (formData.aspects.length === 0) errors.aspects = 'Selecciona al menos un aspecto destacado';
    } else if (step === 4) {
        if (!document.getElementById('districtInput').value.trim()) errors.district = 'Ingresa el distrito';
        if (!document.getElementById('addressInput').value.trim()) errors.address = 'Ingresa la dirección';
        if (!document.getElementById('postalInput').value.trim()) errors.postal = 'Ingresa el código postal';
    }

    Object.keys(errors).forEach(field => {
        const errorEl = document.getElementById(`error-${field}`);
        if (errorEl) {
            errorEl.textContent = errors[field];
            errorEl.classList.add('show');
        }
    });

    return Object.keys(errors).length === 0;
}

function clearErrors() {
    document.querySelectorAll('.error-message').forEach(el => {
        el.classList.remove('show');
        el.textContent = '';
    });
}

function generateSummary() {
    const summary = `
        <div style="margin-bottom: 16px;">
            <strong style="display: block; margin-bottom: 8px; color: var(--naranja-principal);">Tipo de Propiedad</strong>
            <p>${formData.propertyType.charAt(0).toUpperCase() + formData.propertyType.slice(1)} - ${formData.accommodation}</p>
        </div>
        <div style="margin-bottom: 16px;">
            <strong style="display: block; margin-bottom: 8px; color: var(--naranja-principal);">Características</strong>
            <p>${formData.metrage}m² | ${formData.bedrooms} Hab. | ${formData.bathrooms} Baños</p>
        </div>
        <div style="margin-bottom: 16px;">
            <strong style="display: block; margin-bottom: 8px; color: var(--naranja-principal);">Comodidades</strong>
            <p>${formData.amenities.length > 0 ? formData.amenities.join(', ') : 'Ninguna seleccionada'}</p>
        </div>
        <div style="margin-bottom: 16px;">
            <strong style="display: block; margin-bottom: 8px; color: var(--naranja-principal);">Ubicación</strong>
            <p>${formData.district}, ${formData.address}<br/>Código Postal: ${formData.postal}</p>
        </div>
        <div style="margin-bottom: 16px;">
            <strong style="display: block; margin-bottom: 8px; color: var(--naranja-principal);">Descripción</strong>
            <p style="font-size: 13px;">${formData.description}</p>
        </div>
    `;
    document.getElementById('summaryContent').innerHTML = summary;
}

nextBtn.addEventListener('click', () => {
    clearErrors();
    if (validateStep(currentStep)) {
        if (currentStep < totalSteps) {
            if (currentStep === totalSteps - 1) {
                generateSummary();
            }
            currentStep++;
            showStep(currentStep);
        } else {
            submitForm();
        }
    }
});

backBtn.addEventListener('click', () => {
    clearErrors();
    if (currentStep > 1) {
        currentStep--;
        showStep(currentStep);
    }
});

closeBtn.addEventListener('click', () => {
    if (confirm('¿Deseas cerrar sin guardar?')) {
        window.history.back();
    }
});

// Property type selection
document.querySelectorAll('.option-card').forEach(card => {
    card.addEventListener('click', () => {
        document.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        formData.propertyType = card.dataset.value;
        clearErrors();
    });
});

// Accommodation type
document.querySelectorAll('input[name="accommodation"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        formData.accommodation = e.target.value;
        clearErrors();
    });
});

// Metrage
document.getElementById('metrageInput').addEventListener('input', (e) => {
    formData.metrage = e.target.value;
});

// Stepper controls
document.querySelectorAll('.stepper-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const type = btn.dataset.type;
        const action = btn.dataset.action;
        const valueEl = document.getElementById(`${type}Value`);
        let current = parseInt(valueEl.textContent);

        if (action === 'increase' && current < 10) current++;
        if (action === 'decrease' && current > 1) current--;

        valueEl.textContent = current;
        formData[type] = current;
    });
});

// Amenities checkboxes
document.querySelectorAll('#amenity-wifi, #amenity-parking, #amenity-ac, #amenity-furnished, #amenity-kitchen, #amenity-washer, #amenity-tv, #amenity-gym').forEach(checkbox => {
    checkbox.addEventListener('change', () => {
        formData.amenities = Array.from(
            document.querySelectorAll('#amenity-wifi:checked, #amenity-parking:checked, #amenity-ac:checked, #amenity-furnished:checked, #amenity-kitchen:checked, #amenity-washer:checked, #amenity-tv:checked, #amenity-gym:checked')
        ).map(cb => cb.value);
    });
});

// Highlights - máximo 2
document.querySelectorAll('#highlight-views, #highlight-pool, #highlight-garden, #highlight-terrace').forEach(checkbox => {
    checkbox.addEventListener('change', () => {
        const checked = document.querySelectorAll('#highlight-views:checked, #highlight-pool:checked, #highlight-garden:checked, #highlight-terrace:checked');
        if (checked.length > 2) {
            checkbox.checked = false;
        } else {
            formData.highlights = Array.from(checked).map(cb => cb.value);
            document.getElementById('highlightCount').textContent = formData.highlights.length;
        }
    });
});

// Security checkboxes
document.querySelectorAll('#security-lock, #security-alarm, #security-camera, #security-guard').forEach(checkbox => {
    checkbox.addEventListener('change', () => {
        formData.security = Array.from(
            document.querySelectorAll('#security-lock:checked, #security-alarm:checked, #security-camera:checked, #security-guard:checked')
        ).map(cb => cb.value);
    });
});

// Title
document.getElementById('titleInput').addEventListener('input', (e) => {
    formData.title = e.target.value;
});

// Description
document.getElementById('descriptionInput').addEventListener('input', (e) => {
    formData.description = e.target.value;
});

// Aspects - máximo 2
document.querySelectorAll('.aspect-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', () => {
        const checked = document.querySelectorAll('.aspect-checkbox:checked');
        if (checked.length > 2) {
            checkbox.checked = false;
        } else {
            formData.aspects = Array.from(checked).map(cb => cb.value);
            document.getElementById('aspectCount').textContent = formData.aspects.length;
        }
    });
});

// Location fields
document.getElementById('districtInput').addEventListener('input', (e) => {
    formData.district = e.target.value;
});

document.getElementById('addressInput').addEventListener('input', (e) => {
    formData.address = e.target.value;
});

document.getElementById('postalInput').addEventListener('input', (e) => {
    formData.postal = e.target.value;
});

// Map placeholder click
document.getElementById('mapPlaceholder').addEventListener('click', () => {
    alert('En una aplicación real, aquí se abriría un mapa interactivo para fijar la ubicación exacta.');
});

function submitForm() {
    console.log('Datos del formulario:', formData);
    successMessage.classList.add('show');
    form.style.display = 'none';
    nextBtn.disabled = true;
    backBtn.disabled = true;
    nextBtn.textContent = '✓ Registrada';
    
    setTimeout(() => {
        alert('¡Propiedad registrada exitosamente!\n\n' + 
            `${formData.title}\n` + 
            `${formData.district} - ${formData.address}\n\n` + 
            `Características: ${formData.bedrooms} hab, ${formData.bathrooms} baños, ${formData.metrage}m²`);
    }, 500);
}

showStep(1);
