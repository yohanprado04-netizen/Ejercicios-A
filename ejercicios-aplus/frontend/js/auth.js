// auth.js
let currentUser = null;

async function login() {
  const username = document.getElementById('loginUser').value.trim();
  const password = document.getElementById('loginPass').value;
  const errEl = document.getElementById('loginError');
  errEl.classList.add('hidden');
  if (!username || !password) { errEl.textContent = 'Completa todos los campos'; errEl.classList.remove('hidden'); return; }

  const btn = document.querySelector('#formLogin .btn-primary');
  btn.textContent = 'Entrando...'; btn.disabled = true;

  const res = await API.login({ username, password });
  btn.textContent = 'Entrar →'; btn.disabled = false;

  if (res.success) {
    localStorage.setItem('ea_token', res.token);
    localStorage.setItem('ea_user', JSON.stringify(res.user));
    currentUser = res.user;
    iniciarApp();
  } else {
    errEl.textContent = res.message || 'Error al iniciar sesión';
    errEl.classList.remove('hidden');
  }
}

async function register() {
  const nombre = document.getElementById('regNombre').value.trim();
  const username = document.getElementById('regUser').value.trim();
  const password = document.getElementById('regPass').value;
  const errEl = document.getElementById('regError');
  errEl.classList.add('hidden');
  if (!nombre || !username || !password) { errEl.textContent = 'Completa todos los campos'; errEl.classList.remove('hidden'); return; }
  if (password.length < 4) { errEl.textContent = 'La contraseña debe tener mínimo 4 caracteres'; errEl.classList.remove('hidden'); return; }

  const btn = document.querySelector('#formRegister .btn-primary');
  btn.textContent = 'Creando...'; btn.disabled = true;

  const res = await API.register({ nombre, username, password });
  btn.textContent = 'Registrarse →'; btn.disabled = false;

  if (res.success) {
    localStorage.setItem('ea_token', res.token);
    localStorage.setItem('ea_user', JSON.stringify(res.user));
    currentUser = res.user;
    iniciarApp();
  } else {
    errEl.textContent = res.message || 'Error al registrarse';
    errEl.classList.remove('hidden');
  }
}

function logout() {
  localStorage.removeItem('ea_token');
  localStorage.removeItem('ea_user');
  currentUser = null;
  document.getElementById('loginUser').value = '';
  document.getElementById('loginPass').value = '';
  document.getElementById('app-login').classList.add('active');
  document.getElementById('app-main').classList.remove('active');
  showSection('home');
}

function switchAuth(form) {
  document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
  document.getElementById(form === 'login' ? 'formLogin' : 'formRegister').classList.add('active');
}

function toggleUserMenu() {
  document.getElementById('userMenu').classList.toggle('hidden');
}

document.addEventListener('click', (e) => {
  const menu = document.getElementById('userMenu');
  const chip = document.querySelector('.user-chip');
  if (menu && !menu.contains(e.target) && chip && !chip.contains(e.target)) {
    menu.classList.add('hidden');
  }
});

window.login = login;
window.register = register;
window.logout = logout;
window.switchAuth = switchAuth;
window.toggleUserMenu = toggleUserMenu;
window.getCurrentUser = () => currentUser;
