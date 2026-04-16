// practica.js
let ejercicioActual = null;
let progresoPractica = []; // qrs resueltos
let pistaActual = null;
let intentos = 0;

async function iniciarPractica() {
  document.getElementById('celebracion').classList.add('hidden');
  document.getElementById('practica-inicio').classList.add('hidden');
  document.getElementById('practica-juego').classList.remove('hidden');

  const qrGrid = document.getElementById('qrGrid');
  qrGrid.innerHTML = '<div class="loading-state">Cargando ejercicio...</div>';

  const res = await API.ejercicioAleatorio();
  if (!res.success) { toast('Error al cargar ejercicio', 'error'); return; }

  ejercicioActual = res.ejercicio;
  progresoPractica = [];

  document.getElementById('ejTitulo').textContent = ejercicioActual.titulo;
  document.getElementById('ejCategoria').textContent = formatCategoria(ejercicioActual.categoria);
  document.getElementById('ejDesc').textContent = ejercicioActual.descripcionGeneral;

  actualizarProgreso(0);
  renderQrGrid();
  document.getElementById('resolverPanel').style.display = 'none';
}

function renderQrGrid() {
  const grid = document.getElementById('qrGrid');
  grid.innerHTML = '';
  const total = ejercicioActual.pistas.length;
  for (let i = 0; i < total; i++) {
    const num = i + 1;
    const resuelto = progresoPractica.includes(num);
    const esCurrent = !resuelto && (progresoPractica.length === i);
    const locked = !resuelto && progresoPractica.length < i;

    const item = document.createElement('div');
    item.className = `qr-item ${resuelto ? 'solved' : ''} ${locked ? 'locked' : ''} ${esCurrent ? 'current' : ''}`;
    item.innerHTML = `
      <div class="qr-item-num">QR ${num}</div>
      <div class="qr-item-icon">${resuelto ? '✅' : locked ? '🔒' : '📱'}</div>
      <div class="qr-item-label">${resuelto ? 'Resuelto' : locked ? 'Bloqueado' : 'Activo'}</div>
    `;

    if (!locked) {
      item.onclick = () => resuelto ? verQrResuelto(num) : abrirResolver(num);
    }
    grid.appendChild(item);
  }
}

async function abrirResolver(num) {
  const pista = ejercicioActual.pistas.find(p => p.numero === num);
  if (!pista) return;
  pistaActual = num;
  intentos = 0;

  // Generar QR visual
  const qrRes = await API.generarQR({ ejercicioId: ejercicioActual.id, pistaNumero: num });
  if (qrRes.success && qrRes.qr) {
    document.getElementById('qrImage').src = qrRes.qr;
    document.getElementById('qrModalTitle').textContent = `QR #${num}`;
    document.getElementById('qrModalDesc').textContent = pista.descripcion;
    document.getElementById('qrModal').classList.remove('hidden');
    setTimeout(() => document.getElementById('qrModal').classList.add('hidden'), 2500);
  }

  document.getElementById('resolverNum').textContent = `QR #${num}`;
  document.getElementById('resolverDesc').textContent = pista.descripcion;
  document.getElementById('resolverPregunta').textContent = pista.pregunta;
  document.getElementById('resolverPista').textContent = `💡 Pista: ${pista.pista || 'Analiza el enunciado'}`;
  document.getElementById('resolverInput').value = '';
  document.getElementById('intentosCount').textContent = '0';
  document.getElementById('resolverFeedback').classList.add('hidden');
  document.getElementById('resolverPanel').style.display = 'block';
  document.getElementById('resolverInput').focus();

  document.getElementById('resolverPanel').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

async function verificarRespuesta() {
  const respuesta = document.getElementById('resolverInput').value.trim();
  if (!respuesta) { toast('Escribe una respuesta', 'error'); return; }

  intentos++;
  document.getElementById('intentosCount').textContent = intentos;

  const res = await API.verificar({ ejercicioId: ejercicioActual.id, pistaNumero: pistaActual, respuesta });
  const feedback = document.getElementById('resolverFeedback');
  feedback.classList.remove('hidden', 'ok', 'err');

  if (res.correcto) {
    feedback.textContent = `✅ ¡Correcto! +${res.puntos || 5} puntos`;
    feedback.classList.add('ok');
    progresoPractica.push(pistaActual);
    actualizarProgreso(progresoPractica.length);

    setTimeout(() => {
      document.getElementById('resolverPanel').style.display = 'none';
      renderQrGrid();
      if (progresoPractica.length >= ejercicioActual.pistas.length) {
        completarPractica();
      } else {
        // Auto-abrir siguiente
        setTimeout(() => abrirResolver(pistaActual + 1), 600);
      }
    }, 1200);
  } else {
    feedback.textContent = res.message || '❌ Fórmula incorrecta. ¡Intenta de nuevo!';
    feedback.classList.add('err');
    document.getElementById('resolverInput').select();
  }
}

function actualizarProgreso(resueltos) {
  const total = ejercicioActual?.pistas?.length || 20;
  document.getElementById('progActual').textContent = resueltos;
  document.getElementById('progressBar').style.width = `${(resueltos / total) * 100}%`;
}

function completarPractica() {
  document.getElementById('celebracion').classList.remove('hidden');
  toast('🏆 ¡Felicitaciones! Completaste el ejercicio', 'success');
}

function cerrarResolver() {
  document.getElementById('resolverPanel').style.display = 'none';
}

function abandonarPractica() {
  if (confirm('¿Seguro que quieres salir del ejercicio?')) {
    ejercicioActual = null;
    progresoPractica = [];
    document.getElementById('practica-juego').classList.add('hidden');
    document.getElementById('practica-inicio').classList.remove('hidden');
  }
}

function verQrResuelto(num) {
  toast(`QR #${num} ya fue resuelto ✅`, 'success');
}

function cerrarQrModal() {
  document.getElementById('qrModal').classList.add('hidden');
}

function formatCategoria(cat) {
  const map = {
    nomina_empresa: 'Nómina Empresarial',
    tienda: 'Tienda Comercial',
    trabajadores: 'Trabajadores / Liquidación',
    prestaciones: 'Prestaciones Sociales',
    impuestos: 'Impuestos',
    seguridad_social: 'Seguridad Social'
  };
  return map[cat] || cat;
}

// Abrir ejercicio específico desde escaneo de QR (parámetros en URL)
async function abrirEjercicioDesdeQR(ejId, pistaNum) {
  // Mostrar panel de juego
  document.getElementById('celebracion').classList.add('hidden');
  document.getElementById('practica-inicio').classList.add('hidden');
  document.getElementById('practica-juego').classList.remove('hidden');

  const qrGrid = document.getElementById('qrGrid');
  qrGrid.innerHTML = '<div class="loading-state">Cargando ejercicio...</div>';

  // Si ya tenemos ese ejercicio cargado, no volver a pedirlo
  if (!ejercicioActual || ejercicioActual.id !== ejId) {
    const res = await API.ejercicioById(ejId);
    if (!res.success) {
      // Si falla (ej. ejercicio no encontrado), cargar uno aleatorio
      const res2 = await API.ejercicioAleatorio();
      if (!res2.success) { toast('Error al cargar ejercicio', 'error'); return; }
      ejercicioActual = res2.ejercicio;
      progresoPractica = [];
    } else {
      ejercicioActual = res.ejercicio;
      // Mantener progreso si es el mismo ejercicio, si no, reiniciar
      if (!ejercicioActual || ejercicioActual.id !== ejId) progresoPractica = [];
    }
  }

  document.getElementById('ejTitulo').textContent = ejercicioActual.titulo;
  document.getElementById('ejCategoria').textContent = formatCategoria(ejercicioActual.categoria);
  document.getElementById('ejDesc').textContent = ejercicioActual.descripcionGeneral;

  actualizarProgreso(progresoPractica.length);
  renderQrGrid();

  // Abrir directamente el resolver de esa pista
  const pistaExiste = ejercicioActual.pistas.find(p => p.numero === pistaNum);
  if (pistaExiste && !progresoPractica.includes(pistaNum)) {
    setTimeout(() => abrirResolver(pistaNum), 400);
  } else if (pistaExiste && progresoPractica.includes(pistaNum)) {
    toast(`QR #${pistaNum} ya fue resuelto ✅`, 'success');
  }
}

window.abrirEjercicioDesdeQR = abrirEjercicioDesdeQR;


window.cerrarResolver = cerrarResolver;
window.verificarRespuesta = verificarRespuesta;
window.abandonarPractica = abandonarPractica;
window.cerrarQrModal = cerrarQrModal;
