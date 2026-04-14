// ui.js — Utilidades de interfaz

function toast(msg, type = 'success', duration = 3500) {
  const container = document.getElementById('toastContainer');
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
  t.innerHTML = `<span>${icon}</span><span>${msg}</span>`;
  container.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateX(100%)'; t.style.transition = '.3s'; setTimeout(() => t.remove(), 300); }, duration);
}

function showSection(name) {
  document.querySelectorAll('.app-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  const sec = document.getElementById(`sec-${name}`);
  const btn = document.querySelector(`[data-section="${name}"]`);
  if (sec) sec.classList.add('active');
  if (btn) btn.classList.add('active');
  if (name === 'historial') cargarHistorial();
}

// Crear nodos flotantes en login
function crearNodosFlotantes() {
  const container = document.getElementById('floatingNodes');
  if (!container) return;
  for (let i = 0; i < 18; i++) {
    const node = document.createElement('div');
    node.className = 'node';
    node.style.cssText = `
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      --dur: ${6 + Math.random() * 8}s;
      --del: -${Math.random() * 8}s;
      opacity: ${0.3 + Math.random() * 0.5};
    `;
    container.appendChild(node);
  }
}

window.toast = toast;
window.showSection = showSection;
window.crearNodosFlotantes = crearNodosFlotantes;
