document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    showStep(1);
    setupEventListeners();
});

let currentStep = 1;
const totalSteps = 5;

function showStep(step) {
    document.querySelectorAll('fieldset').forEach(fs => fs.classList.remove('active'));
    const activeFieldset = document.querySelector(`fieldset[data-step="${step}"]`);
    if (activeFieldset) activeFieldset.classList.add('active');
    
    document.getElementById('backBtn').classList.toggle('show', step > 1);
    const nextBtn = document.getElementById('nextBtn');
    nextBtn.textContent = step === totalSteps ? 'Registrar mi Propiedad' : 'Siguiente';
    
    const progressFill = document.getElementById('progressFill');
    progressFill.style.width = `${(step / totalSteps) * 100}%`;
    document.getElementById('progressText').textContent = `Paso ${step} de ${totalSteps}`;
}

function setupEventListeners() {
    document.getElementById('nextBtn').addEventListener('click', async () => {
        if (currentStep < totalSteps) {
            currentStep++;
            showStep(currentStep);
        } else {
            await submitForm();
        }
    });

    document.getElementById('backBtn').addEventListener('click', () => {
        if (currentStep > 1) {
            currentStep--;
            showStep(currentStep);
        }
    });

    // Event listeners para la interacción visual de selecciones
    document.querySelectorAll('.option-card, .amenity-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (btn.classList.contains('option-card')) {
                // Deseleccionar otras tarjetas del mismo grupo
                btn.closest('.option-grid').querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
            }
            btn.classList.toggle('selected'); // Usar 'selected' como clase única
        });
    });

    document.querySelectorAll('.stepper button').forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.dataset.type;
            const valueEl = document.getElementById(`${type}Value`);
            let current = parseInt(valueEl.textContent);
            if (btn.textContent === '+' && current < 16) current++;
            if (btn.textContent === '-' && current > 0) current--;
            valueEl.textContent = current;
        });
    });
}

function collectFormData() {
    const getSelectedValues = (selector) => 
        Array.from(document.querySelectorAll(selector))
             .filter(el => el.classList.contains('selected'))
             .map(el => el.dataset.value);

    const safeInt = (id) => parseInt(document.getElementById(id).textContent, 10) || 0;

    return {
        tipoPropiedad: document.querySelector('#propertyTypes .option-card.selected')?.dataset.value || '',
        tipoAlojamiento: document.querySelector('input[name="accommodation"]:checked')?.value || '',
        pais: document.getElementById('countryInput').value,
        direccion: document.getElementById('addressInput').value.trim(),
        apartamento: document.getElementById('apartmentInput').value.trim(),
        distrito: document.getElementById('districtInput').value.trim(),
        codigoPostal: document.getElementById('postalInput').value.trim(),
        provincia: document.getElementById('stateInput').value.trim(),
        mostrarUbicacionExacta: document.getElementById('showExactLocation').checked,
        huespedes: safeInt('huespedesValue'),
        habitaciones: safeInt('habitacionesValue'),
        camas: safeInt('camasValue'),
        baños: safeInt('bañosValue'),
        comodidades: getSelectedValues('h4:first-of-type + .amenities-grid .amenity-btn'),
        comodidadesDestacadas: getSelectedValues('h4:nth-of-type(2) + .amenities-grid .amenity-btn'),
        seguridad: getSelectedValues('h4:nth-of-type(3) + .amenities-grid .amenity-btn'),
        titulo: document.getElementById('titleInput').value.trim(),
        descripcion: document.getElementById('descriptionInput').value.trim(),
        aspectos: getSelectedValues('.aspect-btn')
    };
}

async function submitForm() {
    const nextBtn = document.getElementById('nextBtn');
    nextBtn.disabled = true;
    nextBtn.textContent = 'Registrando...';

    const propertyData = collectFormData();
    console.log("Enviando los siguientes datos recolectados:", propertyData);

    if (!propertyData.tipoPropiedad || !propertyData.titulo) {
        alert('El tipo de propiedad y el título son obligatorios.');
        nextBtn.disabled = false;
        nextBtn.textContent = 'Registrar mi Propiedad';
        return;
    }

    try {
        const response = await fetchWithAuth('/propiedades', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(propertyData)
        });

        if (response.ok) {
            document.getElementById('successMessage').classList.add('show');
            document.getElementById('propertyForm').style.display = 'none';
            document.querySelector('footer').style.display = 'none';
            setTimeout(() => window.location.href = '3-menu-principal.html', 2000);
        } else {
            const errorData = await response.json();
            alert(`Error al registrar: ${errorData.message || 'Revise los datos e intente de nuevo.'}`);
        }
    } catch (error) {
        alert('Error de conexión. No se pudo registrar la propiedad.');
    } finally {
        nextBtn.disabled = false;
        nextBtn.textContent = 'Registrar mi Propiedad';
    }
}
