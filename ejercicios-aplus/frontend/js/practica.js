// practica.js — versión mejorada
let ejercicioActual = null;
let progresoPractica = [];
let pistaActual = null;
let intentos = 0;
const MAX_INTENTOS_PISTA = 3; // después de 3 intentos, mostrar pista extra

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
    // Cualquier QR hasta el siguiente disponible está desbloqueado
    const siguienteDisponible = progresoPractica.length + 1;
    const locked = !resuelto && num > siguienteDisponible;
    const esCurrent = !resuelto && num === siguienteDisponible;

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

  // Generar QR visual y mostrarlo con toda la info de la pista
  const qrRes = await API.generarQR({ ejercicioId: ejercicioActual.id, pistaNumero: num });
  if (qrRes.success && qrRes.qr) {
    document.getElementById('qrImage').src = qrRes.qr;
    document.getElementById('qrModalTitle').textContent = `QR #${num} — ${pista.descripcion}`;
    // Mostrar pregunta y pista dentro del modal QR
    const tipoLabel = pista.tipo === 'formula' ? '📐 Fórmula Excel'
      : pista.tipo === 'valor' ? '🔢 Valor numérico o %'
      : '📝 Texto';
    document.getElementById('qrModalDesc').innerHTML =
      `<strong>${pista.pregunta}</strong><br>
       <span style="color:#aaa;font-size:12px">💡 ${pista.pista || 'Analiza el enunciado'}</span><br>
       <span style="color:#888;font-size:11px">Formato: ${tipoLabel}</span>`;
    document.getElementById('qrModal').classList.remove('hidden');
    // NO se cierra automáticamente — el usuario lo cierra cuando ya leyó
  }

  document.getElementById('resolverNum').textContent = `QR #${num}`;
  document.getElementById('resolverDesc').textContent = pista.descripcion;
  document.getElementById('resolverPregunta').textContent = pista.pregunta;

  // Mostrar pista con formato de respuesta esperado
  const tipoLabel = pista.tipo === 'formula' ? '📐 Fórmula Excel'
    : pista.tipo === 'valor' ? '🔢 Valor numérico o %'
    : '📝 Texto';
  document.getElementById('resolverPista').innerHTML =
    `💡 <b>Pista:</b> ${pista.pista || 'Analiza el enunciado'}<br>
     <small style="color:#888">Formato esperado: <b>${tipoLabel}</b></small>`;

  document.getElementById('resolverInput').value = '';
  document.getElementById('intentosCount').textContent = '0';
  document.getElementById('resolverFeedback').classList.add('hidden');

  // Ocultar bloque de pista extra al abrir nuevo QR
  const pistaExtraDiv = document.getElementById('pistaExtraDiv');
  if (pistaExtraDiv) pistaExtraDiv.style.display = 'none';

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
        // Auto-abrir siguiente QR
        setTimeout(() => abrirResolver(pistaActual + 1), 600);
      }
    }, 1200);
  } else {
    // Mostrar mensaje de error
    feedback.textContent = '❌ Respuesta incorrecta. ¡Revisa la pista y vuelve a intentarlo!';
    feedback.classList.add('err');
    document.getElementById('resolverInput').select();

    // Después de MAX_INTENTOS_PISTA intentos, mostrar pista extra con ejemplos
    if (intentos >= MAX_INTENTOS_PISTA) {
      mostrarPistaExtra();
    }
  }
}

async function mostrarPistaExtra() {
  let pistaExtraDiv = document.getElementById('pistaExtraDiv');
  if (!pistaExtraDiv) {
    pistaExtraDiv = document.createElement('div');
    pistaExtraDiv.id = 'pistaExtraDiv';
    pistaExtraDiv.style.cssText = [
      'background:#000',
      'color:#fff',
      'border-radius:10px',
      'padding:16px 18px',
      'margin-top:14px',
      'font-size:0.92em',
      'line-height:1.6',
      'border:1px solid #333',
      'box-shadow:0 4px 20px rgba(0,0,0,0.6)'
    ].join(';');
    document.getElementById('resolverPanel').appendChild(pistaExtraDiv);
  }

  // Pedir pista extra al servidor
  const res = await API.pistaExtra({ ejercicioId: ejercicioActual.id, pistaNumero: pistaActual });
  if (res && res.success) {
    const alts = res.alternativas && res.alternativas.length
      ? `<div style="margin-top:8px;color:#ccc">✅ <b>Formas aceptadas:</b> ${res.alternativas.slice(0, 3).join(', ')}</div>`
      : '';
    pistaExtraDiv.innerHTML = `
      <div style="font-size:1em;font-weight:700;color:#f59e0b;margin-bottom:8px">
        🆘 Ayuda tras ${intentos} intentos
      </div>
      <div style="color:#e5e5e5">${res.pista}</div>
      ${alts}
      <div style="margin-top:8px;color:#9ca3af;font-size:0.85em">${res.formatoEjemplo}</div>
    `;
    pistaExtraDiv.style.display = 'block';
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
  document.getElementById('celebracion').classList.add('hidden');
  document.getElementById('practica-inicio').classList.add('hidden');
  document.getElementById('practica-juego').classList.remove('hidden');

  const qrGrid = document.getElementById('qrGrid');
  qrGrid.innerHTML = '<div class="loading-state">Cargando ejercicio...</div>';

  if (!ejercicioActual || ejercicioActual.id !== ejId) {
    const res = await API.ejercicioById(ejId);
    if (!res.success) {
      const res2 = await API.ejercicioAleatorio();
      if (!res2.success) { toast('Error al cargar ejercicio', 'error'); return; }
      ejercicioActual = res2.ejercicio;
      progresoPractica = [];
    } else {
      ejercicioActual = res.ejercicio;
      if (!ejercicioActual || ejercicioActual.id !== ejId) progresoPractica = [];
    }
  }

  document.getElementById('ejTitulo').textContent = ejercicioActual.titulo;
  document.getElementById('ejCategoria').textContent = formatCategoria(ejercicioActual.categoria);
  document.getElementById('ejDesc').textContent = ejercicioActual.descripcionGeneral;

  actualizarProgreso(progresoPractica.length);
  renderQrGrid();

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