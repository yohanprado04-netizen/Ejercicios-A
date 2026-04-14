// app.js — Punto de entrada de la aplicación

document.addEventListener('DOMContentLoaded', async () => {
  crearNodosFlotantes();

  // Verificar sesión guardada
  const token = localStorage.getItem('ea_token');
  const savedUser = localStorage.getItem('ea_user');

  if (token && savedUser) {
    try {
      const userData = JSON.parse(savedUser);
      window.currentUser = userData;

      // Verificar token con el servidor
      const res = await API.profile();
      if (res.success) {
        window.currentUser = res.user;
        localStorage.setItem('ea_user', JSON.stringify(res.user));
        iniciarApp();
        return;
      }
    } catch (_) {}
    // Token inválido, limpiar
    localStorage.removeItem('ea_token');
    localStorage.removeItem('ea_user');
  }

  // Mostrar pantalla de login
  document.getElementById('app-login').classList.add('active');
});

function iniciarApp() {
  const user = window.currentUser || JSON.parse(localStorage.getItem('ea_user') || '{}');
  window.currentUser = user;

  // Actualizar UI con datos del usuario
  document.getElementById('heroNombre').textContent = user.nombre || 'Estudiante';
  document.getElementById('userNameDisplay').textContent = user.nombre || 'Usuario';
  document.getElementById('userAvatar').textContent = (user.nombre || 'U')[0].toUpperCase();
  document.getElementById('menuNombre').textContent = user.nombre || '—';
  document.getElementById('menuUsername').textContent = '@' + (user.username || '');

  // Stats topbar
  const qr = user.totalQrResueltos || 0;
  const victorias = user.totalVictorias || 0;
  const partidas = user.totalPartidasJugadas || 0;
  const puntaje = user.puntajeTotal || 0;

  document.getElementById('statQR').textContent = qr;
  document.getElementById('statVictorias').textContent = victorias;
  document.getElementById('statPartidas').textContent = partidas;

  document.getElementById('gsQR').textContent = qr;
  document.getElementById('gsVictorias').textContent = victorias;
  document.getElementById('gsPartidas').textContent = partidas;
  document.getElementById('gsPuntaje').textContent = puntaje;

  // Transición de pantallas
  document.getElementById('app-login').classList.remove('active');
  document.getElementById('app-main').classList.add('active');

  showSection('home');
}

// Sobreescribir getCurrentUser para que use window.currentUser
window.getCurrentUser = () => window.currentUser || JSON.parse(localStorage.getItem('ea_user') || 'null');
window.iniciarApp = iniciarApp;

// Enter en campos login/register
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    if (document.getElementById('formLogin').classList.contains('active')) login();
    else if (document.getElementById('formRegister').classList.contains('active')) register();
  }
});
