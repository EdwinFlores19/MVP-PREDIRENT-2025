const BASE_URL = 'http://localhost:3000/api';

async function fetchWithAuth(endpoint, options = {}) {
    const token = localStorage.getItem('token');

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (response.status === 401 || response.status === 403) {
        // Token inválido o expirado
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '1-login.html';
        throw new Error('Authentication failed');
    }

    return response;
}

function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '1-login.html';
    }
}
