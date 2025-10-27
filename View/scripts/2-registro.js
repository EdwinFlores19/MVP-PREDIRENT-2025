// === ELEMENTOS DEL DOM ===
const registerForm = document.getElementById('registerForm');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const termsCheckbox = document.getElementById('terms');
const submitBtn = document.getElementById('submitBtn');
const registerCard = document.querySelector('.register-card');
const notification = document.getElementById('notification');

// Elementos de error
const nameError = document.getElementById('nameError');
const emailError = document.getElementById('emailError');
const passwordError = document.getElementById('passwordError');
const termsError = document.getElementById('termsError');

// === VALIDACIÓN Y REGISTRO DEL FORMULARIO ===
registerForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    if (!validateForm()) {
        showNotification('error', `Por favor corrige los errores para continuar.`);
        return;
    }

    registerCard.classList.add('loading');

    const userData = {
        nombreCompleto: nameInput.value.trim(),
        email: emailInput.value.trim(),
        password: passwordInput.value
    };

    try {
        const response = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();

        if (response.status === 201) {
            const firstName = userData.nombreCompleto.split(' ')[0];
            showNotification('success', `¡Registro exitoso! Bienvenido ${firstName} 🎉`);
            setTimeout(() => {
                window.location.href = '1-login.html';
            }, 2000);
        } else {
            if (response.status === 409) {
                showFieldError(emailInput, emailError, data.message || 'El correo electrónico ya está registrado.');
            } else if (data.errors) {
                data.errors.forEach(err => {
                    if (err.param === 'nombreCompleto') showFieldError(nameInput, nameError, err.msg);
                    if (err.param === 'email') showFieldError(emailInput, emailError, err.msg);
                    if (err.param === 'password') showFieldError(passwordInput, passwordError, err.msg);
                });
            }
            showNotification('error', data.message || 'Error en el registro.');
        }
    } catch (error) {
        console.error('Error de red:', error);
        showNotification('error', 'Error de conexión. Inténtalo de nuevo.');
    } finally {
        registerCard.classList.remove('loading');
    }
});

function validateForm() {
    let isValid = true;
    [nameError, emailError, passwordError, termsError].forEach(el => el.classList.remove('show'));

    if (nameInput.value.trim().length < 3 || !/^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/.test(nameInput.value.trim())) {
        showFieldError(nameInput, nameError, 'Nombre inválido (mín. 3 letras).');
        isValid = false;
    }

    if (!isValidEmail(emailInput.value.trim())) {
        showFieldError(emailInput, emailError, 'Correo electrónico no válido.');
        isValid = false;
    }

    if (passwordInput.value.length < 8 || !/[A-Z]/.test(passwordInput.value) || !/\d/.test(passwordInput.value) || !/[!@#$%^&*(),.?":{}|<>]/.test(passwordInput.value)) {
        showFieldError(passwordInput, passwordError, 'La contraseña no cumple los requisitos.');
        isValid = false;
    }

    if (!termsCheckbox.checked) {
        showFieldError(termsCheckbox, termsError, 'Debes aceptar los términos.');
        isValid = false;
    }

    return isValid;
}

function showNotification(type, message) {
    const icon = notification.querySelector('.icon');
    const messageEl = notification.querySelector('.message');
    notification.className = 'notification ' + type;
    icon.textContent = type === 'success' ? '✓' : '⚠';
    messageEl.textContent = message;
    notification.classList.add('show');
    setTimeout(() => notification.classList.remove('show'), 4000);
}

function showFieldError(input, errorElement, message) {
    input.classList.add('error');
    errorElement.textContent = message;
    errorElement.classList.add('show');
}

function hideFieldError(input, errorElement) {
    input.classList.remove('error');
    errorElement.classList.remove('show');
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

[nameInput, emailInput, passwordInput].forEach(input => {
    input.addEventListener('input', () => hideFieldError(input, input.nextElementSibling.nextElementSibling));
});
termsCheckbox.addEventListener('change', () => hideFieldError(termsCheckbox, termsError));
