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

// === VALIDACIÓN DEL FORMULARIO ===
const loginForm = document.getElementById('loginForm');
const errorMessage = document.getElementById('errorMessage');
const emailInput = document.getElementById('email');
const loginCard = document.querySelector('.login-card');

loginForm.addEventListener('submit', function(e) {
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

    if (password.length < 6) {
        showError('La contraseña debe tener al menos 6 caracteres.');
        return;
    }

    // Efecto de carga
    loginCard.classList.add('loading');
    
    setTimeout(() => {
        loginCard.classList.remove('loading');
        console.log('Intentando iniciar sesión con:', { email, password });
        alert('Formulario validado correctamente. En producción, aquí se enviaría la solicitud al servidor.');
    }, 1500);
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

// === EFECTO DE PARTÍCULAS EN MOVIMIENTO ===
document.querySelectorAll('.particle').forEach((particle, index) => {
    particle.style.animationDelay = `${index * 1.5}s`;
});

// === EFECTO DE ENTRADA PARA INPUTS ===
const inputs = document.querySelectorAll('input');
inputs.forEach(input => {
    input.addEventListener('focus', function() {
        this.parentElement.style.transform = 'scale(1.01)';
    });
    
    input.addEventListener('blur', function() {
        this.parentElement.style.transform = 'scale(1)';
    });
});

// === ANIMACIÓN DE BIENVENIDA ===
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});
