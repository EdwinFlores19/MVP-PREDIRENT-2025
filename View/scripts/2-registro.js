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

// Elementos de hint
const nameHint = document.getElementById('nameHint');
const emailHint = document.getElementById('emailHint');

// Requisitos de contraseña
const reqLength = document.getElementById('req-length');
const reqUppercase = document.getElementById('req-uppercase');
const reqNumber = document.getElementById('req-number');
const reqSpecial = document.getElementById('req-special');

// === VALIDACIÓN EN TIEMPO REAL DE NOMBRE ===
nameInput.addEventListener('input', function() {
    const value = this.value.trim();
    
    // Limpiar error si estaba mostrándose
    if (nameError.classList.contains('show')) {
        hideFieldError(nameInput, nameError);
    }
    
    if (value.length >= 3 && /^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/.test(value)) {
        nameInput.classList.add('success');
        nameHint.classList.add('hidden');
    } else {
        nameInput.classList.remove('success');
        nameHint.classList.remove('hidden');
    }
});

// === VALIDACIÓN EN TIEMPO REAL DE EMAIL ===
emailInput.addEventListener('input', function() {
    const value = this.value.trim();
    
    // Limpiar error si estaba mostrándose
    if (emailError.classList.contains('show')) {
        hideFieldError(emailInput, emailError);
    }
    
    if (isValidEmail(value)) {
        emailInput.classList.add('success');
        emailHint.classList.add('hidden');
    } else {
        emailInput.classList.remove('success');
        emailHint.classList.remove('hidden');
    }
});

// === VALIDACIÓN EN TIEMPO REAL DE CONTRASEÑA ===
passwordInput.addEventListener('input', function() {
    const password = this.value;
    
    // Limpiar error si estaba mostrándose
    if (passwordError.classList.contains('show')) {
        hideFieldError(passwordInput, passwordError);
    }

    // Validar longitud
    if (password.length >= 8) {
        reqLength.classList.add('met');
    } else {
        reqLength.classList.remove('met');
    }

    // Validar mayúscula
    if (/[A-Z]/.test(password)) {
        reqUppercase.classList.add('met');
    } else {
        reqUppercase.classList.remove('met');
    }

    // Validar número
    if (/\d/.test(password)) {
        reqNumber.classList.add('met');
    } else {
        reqNumber.classList.remove('met');
    }

    // Validar carácter especial
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        reqSpecial.classList.add('met');
    } else {
        reqSpecial.classList.remove('met');
    }

    // Marcar como éxito si cumple todos los requisitos
    const allMet = password.length >= 8 && 
                          /[A-Z]/.test(password) && 
                          /\d/.test(password) && 
                          /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    if (allMet) {
        passwordInput.classList.add('success');
    } else {
        passwordInput.classList.remove('success');
    }
});

// === VALIDACIÓN DEL FORMULARIO ===
registerForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    let isValid = true;
    let errors = [];

    // Validar nombre
    const name = nameInput.value.trim();
    if (name.length === 0) {
        showFieldError(nameInput, nameError, 'El nombre es obligatorio');
        errors.push('Nombre');
        isValid = false;
    } else if (name.length < 3) {
        showFieldError(nameInput, nameError, 'El nombre debe tener al menos 3 caracteres');
        errors.push('Nombre');
        isValid = false;
    } else if (!/^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/.test(name)) {
        showFieldError(nameInput, nameError, 'El nombre solo puede contener letras');
        errors.push('Nombre');
        isValid = false;
    }

    // Validar email
    const email = emailInput.value.trim();
    if (email.length === 0) {
        showFieldError(emailInput, emailError, 'El correo electrónico es obligatorio');
        errors.push('Email');
        isValid = false;
    } else if (!isValidEmail(email)) {
        showFieldError(emailInput, emailError, 'Ingresa un correo electrónico válido (ejemplo@dominio.com)');
        errors.push('Email');
        isValid = false;
    }

    // Validar contraseña
    const password = passwordInput.value;
    if (password.length === 0) {
        showFieldError(passwordInput, passwordError, 'La contraseña es obligatoria');
        errors.push('Contraseña');
        isValid = false;
    } else if (password.length < 8 || !/[A-Z]/.test(password) || !/\d/.test(password) || !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        showFieldError(passwordInput, passwordError, 'La contraseña no cumple todos los requisitos de seguridad');
        errors.push('Contraseña');
        isValid = false;
    }

    // Validar términos
    if (!termsCheckbox.checked) {
        showFieldError(termsCheckbox, termsError, 'Debes aceptar los términos y condiciones para continuar');
        errors.push('Términos');
        isValid = false;
    }

    // Si todo es válido, proceder
    if (isValid) {
        registerCard.classList.add('loading');
        
        setTimeout(() => {
            registerCard.classList.remove('loading');
            console.log('Registro exitoso:', { name, email, password });
            
            // Mostrar notificación de éxito
            const firstName = name.split(' ')[0];
            showNotification('success', `¡Registrado correctamente! Bienvenido ${firstName} 🎉`);
            
            // Limpiar formulario después de 2 segundos
            setTimeout(() => {
                registerForm.reset();
                // Resetear estados visuales
                document.querySelectorAll('.success').forEach(el => el.classList.remove('success'));
                document.querySelectorAll('.requirement.met').forEach(el => el.classList.remove('met'));
                nameHint.classList.remove('hidden');
                emailHint.classList.remove('hidden');
            }, 2000);
        }, 1500);
    } else {
        // Mostrar notificación de error
        showNotification('error', `Por favor completa los campos requeridos correctamente`);
        
        // Scroll al primer error
        const firstError = document.querySelector('.field-error.show');
        if (firstError) {
            setTimeout(() => {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
        }
    }
});

// === FUNCIÓN PARA MOSTRAR NOTIFICACIONES ===
function showNotification(type, message) {
    const icon = notification.querySelector('.icon');
    const messageEl = notification.querySelector('.message');
    
    // Configurar el contenido
    if (type === 'success') {
        icon.textContent = '✓';
        notification.classList.remove('error');
        notification.classList.add('success');
    } else {
        icon.textContent = '⚠';
        notification.classList.remove('success');
        notification.classList.add('error');
    }
    
    messageEl.textContent = message;
    
    // Mostrar notificación
    notification.classList.add('show');
    
    // Ocultar después de 4 segundos
    setTimeout(() => {
        notification.classList.remove('show');
    }, 4000);
}

// === FUNCIONES AUXILIARES ===
function showFieldError(input, errorElement, message) {
    input.classList.add('error');
    input.classList.remove('success');
    errorElement.textContent = message;
    errorElement.classList.add('show');
}

function hideFieldError(input, errorElement) {
    input.classList.remove('error');
    errorElement.classList.remove('show');
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// === LIMPIAR ERRORES AL ESCRIBIR ===
termsCheckbox.addEventListener('change', function() {
    if (this.checked && termsError.classList.contains('show')) {
        hideFieldError(this, termsError);
    }
});

// === MANEJO DE BOTONES SOCIALES ===

// === EFECTO DE PARTÍCULAS EN MOVIMIENTO ===
document.querySelectorAll('.particle').forEach((particle, index) => {
    particle.style.animationDelay = `${index * 1.5}s`;
});

// === ANIMACIÓN DE BIENVENIDA ===
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});

// === MANEJO DE BOTONES SOCIALES ===
const socialButtons = document.querySelectorAll('.btn-social');
socialButtons.forEach(button => {
    button.addEventListener('click', function(e) {
        e.preventDefault();
        const platform = this.getAttribute('aria-label');
        console.log('Registro social:', platform);
        alert(`En producción, aquí se iniciaría el flujo de registro con ${platform}`);
    });
});
