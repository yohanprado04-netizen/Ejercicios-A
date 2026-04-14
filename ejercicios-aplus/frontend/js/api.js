// api.js — Centraliza todas las llamadas al backend
const API_BASE = window.location.origin + '/api';

function getToken() { return localStorage.getItem('ea_token'); }

async function apiCall(method, path, body = null) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  try {
    const res = await fetch(API_BASE + path, opts);
    const data = await res.json();
    return data;
  } catch (e) {
    console.error('API Error:', e);
    return { success: false, message: 'Error de conexión con el servidor' };
  }
}

const API = {
  // Auth
  register: (d) => apiCall('POST', '/auth/register', d),
  login: (d) => apiCall('POST', '/auth/login', d),
  profile: () => apiCall('GET', '/auth/profile'),
  historial: () => apiCall('GET', '/auth/historial'),

  // Ejercicios
  ejercicioAleatorio: () => apiCall('GET', '/ejercicios/aleatorio'),
  ejercicioById: (id) => apiCall('GET', `/ejercicios/${id}`),
  verificar: (d) => apiCall('POST', '/ejercicios/verificar', d),
  generarQR: (d) => apiCall('POST', '/ejercicios/generar-qr', d),

  // Partidas
  crearSala: (d) => apiCall('POST', '/partidas/crear', d),
  unirseSala: (d) => apiCall('POST', '/partidas/unirse', d),
  infoSala: (c) => apiCall('GET', `/partidas/sala/${c}`),
  iniciarSala: (c) => apiCall('POST', `/partidas/iniciar/${c}`),
};

window.API = API;
