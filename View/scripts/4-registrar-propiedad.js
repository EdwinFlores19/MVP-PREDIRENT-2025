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

    document.querySelectorAll('.option-card, .amenity-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.classList.contains('option-card')) {
                btn.closest('.option-grid').querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
            }
            btn.classList.toggle('selected');
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

    document.getElementById('btnCalcularPrecio').addEventListener('click', async () => {
        const btn = document.getElementById('btnCalcularPrecio');
        btn.disabled = true;
        btn.textContent = 'Calculando...';
        const resultDiv = document.getElementById('precioSugeridoResult');

        const propertyData = collectFormData();
        try {
            const response = await fetchWithAuth('/api/estimador/prediccion', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(propertyData)
            });
            if (response.ok) {
                const result = await response.json();
                let displayText = `<strong>Precio Sugerido:</strong> S/ ${result.data.precio_predicho.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                if (result.data.dummy) {
                    displayText += ' <small><em>(estimación básica)</em></small>';
                }
                resultDiv.innerHTML = displayText;
                resultDiv.classList.remove('hidden');
            } else {
                const errorData = await response.json();
                resultDiv.innerHTML = `No se pudo calcular: ${errorData.message}`;
                resultDiv.classList.remove('hidden');
            }
        } catch (error) {
            resultDiv.innerHTML = 'Error de conexión con el estimador.';
            resultDiv.classList.remove('hidden');
        } finally {
            btn.disabled = false;
            btn.textContent = 'Calcular Precio Sugerido';
        }
    });
}

function collectFormData() {
    const getSelectedValues = (selector) => 
        Array.from(document.querySelectorAll(selector))
             .filter(el => el.classList.contains('selected'))
             .map(el => el.dataset.value);

    const safeInt = (id) => parseInt(document.getElementById(id).textContent, 10) || 1;

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
    propertyData.calcularPrecio = true; // Indicar al backend que intente calcular y guardar el precio

    if (!propertyData.tipoPropiedad || !propertyData.titulo) {
        alert('El tipo de propiedad y el título son obligatorios.');
        nextBtn.disabled = false;
        nextBtn.textContent = 'Registrar mi Propiedad';
        return;
    }

    try {
        const response = await fetchWithAuth('/api/propiedades', {
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
