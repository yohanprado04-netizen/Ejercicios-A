(function () {
  window.addEventListener('DOMContentLoaded', () => {
    crearNodosFlotantes();
    const token = localStorage.getItem('ea_token');
    const userStr = localStorage.getItem('ea_user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        API.profile().then(res => {
          if (res.success) { localStorage.setItem('ea_user', JSON.stringify(res.user)); iniciarApp(res.user); }
          else { localStorage.removeItem('ea_token'); localStorage.removeItem('ea_user'); mostrarLogin(); }
        }).catch(() => iniciarApp(user));
      } catch (e) { localStorage.removeItem('ea_token'); localStorage.removeItem('ea_user'); mostrarLogin(); }
    } else { mostrarLogin(); }
    document.getElementById('loginPass')?.addEventListener('keydown', e => { if (e.key === 'Enter') login(); });
    document.getElementById('codigoSalaInput')?.addEventListener('input', function () { this.value = this.value.toUpperCase(); });
  });

window.iniciarApp = function (userOverride) {
    let user = userOverride || null;
    if (!user) { try { user = JSON.parse(localStorage.getItem('ea_user')); } catch (e) {} }
    if (!user) { mostrarLogin(); return; }
    if (typeof window.setCurrentUser === 'function') window.setCurrentUser(user);
    actualizarUIUsuario(user);
    document.getElementById('app-login').classList.remove('active');
    document.getElementById('app-main').classList.add('active');

    // Verificar si hay parámetros de QR en la URL (cuando se escanea un QR)
    const params = new URLSearchParams(window.location.search);
    const ejId = params.get('ej');
    const pistaNum = params.get('p');

    if (ejId && pistaNum) {
      // Limpiar la URL sin recargar
      window.history.replaceState({}, '', '/');
      // Ir a práctica y cargar ese ejercicio con esa pista
      showSection('practica');
      // Esperar a que la sección esté visible, luego cargar
      setTimeout(() => abrirEjercicioDesdeQR(parseInt(ejId), parseInt(pistaNum)), 300);
    } else {
      showSection('home');
    }
  };

  function actualizarUIUsuario(user) {
    const nombre = user.nombre || user.username || 'Estudiante';
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set('userAvatar', nombre.charAt(0).toUpperCase());
    set('userNameDisplay', nombre.split(' ')[0]);
    set('heroNombre', nombre.split(' ')[0]);
    set('menuNombre', nombre);
    set('menuUsername', '@' + (user.username || ''));
    set('statQR', user.totalQrResueltos || 0);
    set('statVictorias', user.totalVictorias || 0);
    set('statPartidas', user.totalPartidasJugadas || 0);
    set('gsQR', user.totalQrResueltos || 0);
    set('gsVictorias', user.totalVictorias || 0);
    set('gsPartidas', user.totalPartidasJugadas || 0);
    set('gsPuntaje', user.puntajeTotal || 0);
  }

  function mostrarLogin() {
    document.getElementById('app-login').classList.add('active');
    document.getElementById('app-main').classList.remove('active');
  }
})();