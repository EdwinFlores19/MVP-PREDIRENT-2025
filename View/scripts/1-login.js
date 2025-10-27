// === TOGGLE MOSTRAR/OCULTAR CONTRASEÑA ===
const togglePassword = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');
const eyeOff = document.getElementById('eyeOff');
const eyeOn = document.getElementById('eyeOn');

togglePassword.addEventListener('click', function() {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);

    if (type === 'text') {
        eyeOff.style.display = 'none';
        eyeOn.style.display = 'block';
        togglePassword.setAttribute('aria-label', 'Ocultar contraseña');
    } else {
        eyeOff.style.display = 'block';
        eyeOn.style.display = 'none';
        togglePassword.setAttribute('aria-label', 'Mostrar contraseña');
    }
});

// === VALIDACIÓN DEL FORMULARIO Y LOGIN ===
const loginForm = document.getElementById('loginForm');
const errorMessage = document.getElementById('errorMessage');
const emailInput = document.getElementById('email');
const loginCard = document.querySelector('.login-card');

loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    errorMessage.classList.remove('show');
    
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
        showError('Por favor, completa todos los campos.');
        return;
    }

    if (!isValidEmail(email)) {
        showError('Por favor, ingresa un correo electrónico válido.');
        return;
    }

    loginCard.classList.add('loading');

    try {
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok && data.data.token) {
            console.log('Login exitoso. Datos recibidos:', data.data);
            // Guardar token y datos del usuario
            localStorage.setItem('token', data.data.token);
            localStorage.setItem('user', JSON.stringify(data.data.user));
            
            console.log('Usuario guardado en localStorage:', localStorage.getItem('user'));
            
            // Redirigir al menú principal
            window.location.href = '3-menu-principal.html';
        } else {
            showError(data.message || 'Error en el servidor. Inténtalo de nuevo.');
        }
    } catch (error) {
        console.error('Error de red:', error);
        showError('Error de conexión. Verifica tu conexión a internet.');
    } finally {
        loginCard.classList.remove('loading');
    }
});

// === FUNCIÓN PARA MOSTRAR ERRORES ===
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
    errorMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// === VALIDACIÓN DE EMAIL ===
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// === MANEJO DE BOTONES SOCIALES ===
const socialButtons = document.querySelectorAll('.btn-social');
socialButtons.forEach(button => {
    button.addEventListener('click', function() {
        const platform = this.getAttribute('aria-label');
        console.log('Login social:', platform);
        alert(`En producción, aquí se iniciaría el flujo de autenticación con ${platform}`);
    });
});

// === LIMPIAR ERROR AL ESCRIBIR ===
emailInput.addEventListener('input', function() {
    if (errorMessage.classList.contains('show')) {
        errorMessage.classList.remove('show');
    }
});

passwordInput.addEventListener('input', function() {
    if (errorMessage.classList.contains('show')) {
        errorMessage.classList.remove('show');
    }
});
