// competencia.js
let socket = null;
let salaActual = null;
let esDueno = false;
let ejercicioComp = null;
let progresoComp = [];
let pistaCompActual = null;

function inicializarSocket() {
  if (socket && socket.connected) return;
  socket = io(window.location.origin, { transports: ['websocket', 'polling'] });

  socket.on('connect', () => console.log('🔌 Socket conectado'));
  socket.on('disconnect', () => console.log('🔌 Socket desconectado'));

  socket.on('actualizacion-sala', (data) => {
    actualizarListaParticipantes(data.participantes);
    if (data.message) toast(data.message, 'success');
  });

  socket.on('sala-info', (data) => {
    salaActual = data.codigoSala;
    esDueno = data.esDueno;
    // Asegurarse de mostrar el código en todos los elementos donde aparece
    document.getElementById('salaCodigoDisplay').textContent = data.codigoSala;
    const juegoCodigo = document.getElementById('salaCodigoJuego');
    if (juegoCodigo) juegoCodigo.textContent = data.codigoSala;
    document.getElementById('btnIniciarPartida').style.display = esDueno ? 'flex' : 'none';
    actualizarListaParticipantes(data.participantes || []);
    if (data.estado === 'jugando') {
      cargarEjercicioComp(data.ejercicioId);
    }
  });

  socket.on('partida-iniciada', async (data) => {
    toast('🚀 ¡La partida comenzó!', 'success');
    await cargarEjercicioComp(data.ejercicioId);
  });

  socket.on('progreso-actualizado', (data) => {
    actualizarMarcador(data.participantes);
    if (data.ultimoEvento) {
      const ev = data.ultimoEvento;
      const user = window.getCurrentUser();
      if (ev.username !== user?.username) {
        toast(`${ev.nombre} resolvió QR #${ev.pistaNumero} (${ev.qrResueltos}/20)`, 'success');
      }
    }
  });

  socket.on('jugador-termino', (data) => {
    toast(`🏆 ${data.nombre} llegó al puesto #${data.posicion}!`, 'success');
  });

  socket.on('partida-terminada', (data) => {
    mostrarPantallaFin(data.ganadores, data.participantes);
  });

  socket.on('jugador-desconectado', (data) => {
    toast(`${data.username} se desconectó`, 'error');
  });

  socket.on('error-sala', (data) => {
    toast(data.message, 'error');
  });
}

function mostrarCrearSala() {
  document.getElementById('panelCrear').classList.remove('hidden');
  document.getElementById('panelUnirse').classList.add('hidden');
}

function mostrarUnirseSala() {
  document.getElementById('panelUnirse').classList.remove('hidden');
  document.getElementById('panelCrear').classList.add('hidden');
}

async function crearSala() {
  inicializarSocket();
  const btn = document.querySelector('#panelCrear .btn-primary');
  btn.textContent = 'Creando...'; btn.disabled = true;

  const res = await API.crearSala({});
  btn.textContent = '🎲 Crear Sala Aleatoria'; btn.disabled = false;

  if (!res.success) { toast(res.message, 'error'); return; }

  salaActual = res.codigoSala;
  esDueno = true;

  const user = window.getCurrentUser();
  socket.emit('unirse-sala', {
    codigoSala: res.codigoSala,
    userId: user._id,
    username: user.username,
    nombre: user.nombre
  });

  mostrarPanelSala(res.codigoSala);
}

async function unirseSala() {
  const codigo = document.getElementById('codigoSalaInput').value.trim().toUpperCase();
  if (!codigo || codigo.length < 4) { toast('Ingresa un código válido', 'error'); return; }

  inicializarSocket();
  const res = await API.unirseSala({ codigoSala: codigo });
  if (!res.success) { toast(res.message, 'error'); return; }

  salaActual = codigo;
  esDueno = false;

  const user = window.getCurrentUser();
  socket.emit('unirse-sala', {
    codigoSala: codigo,
    userId: user._id,
    username: user.username,
    nombre: user.nombre
  });

  mostrarPanelSala(codigo);
  if (res.estado === 'jugando') {
    await cargarEjercicioComp(res.ejercicioId);
  }
}

function mostrarPanelSala(codigo) {
  document.getElementById('comp-menu').classList.add('hidden');
  document.getElementById('comp-sala').classList.remove('hidden');
  document.getElementById('salaCodigoDisplay').textContent = codigo;
  // También copiar al portapapeles automáticamente puede ayudar al usuario
  const juegoCodigo = document.getElementById('salaCodigoJuego');
  if (juegoCodigo) juegoCodigo.textContent = codigo;
}

function actualizarListaParticipantes(participantes) {
  const list = document.getElementById('participantesList');
  const num = document.getElementById('numParticipantes');
  if (!list) return;
  num.textContent = participantes.length;
  list.innerHTML = participantes.map(p => `
    <div class="participante-item">
      <div>
        <div class="p-nombre">${p.nombre} ${esDueno && p.username === window.getCurrentUser()?.username ? '👑' : ''}</div>
        <div class="p-status">${p.conectado ? '🟢 Conectado' : '🔴 Desconectado'}</div>
      </div>
    </div>
  `).join('');
}

function copiarCodigo() {
  if (!salaActual) return;
  navigator.clipboard.writeText(salaActual).then(() => toast('Código copiado: ' + salaActual, 'success'));
}

function iniciarPartidaComp() {
  if (!socket || !salaActual) return;
  const user = window.getCurrentUser();
  socket.emit('iniciar-partida', { codigoSala: salaActual, userId: user._id });
}

async function cargarEjercicioComp(ejercicioId) {
  const res = await API.ejercicioById(ejercicioId);
  if (!res.success) { toast('Error al cargar ejercicio', 'error'); return; }

  ejercicioComp = res.ejercicio;
  progresoComp = [];

  document.getElementById('comp-sala').classList.add('hidden');
  document.getElementById('comp-juego').classList.remove('hidden');
  document.getElementById('compEjTitulo').textContent = ejercicioComp.titulo;
  document.getElementById('compEjCategoria').textContent = formatCategoriaComp(ejercicioComp.categoria);
  document.getElementById('salaCodigoJuego').textContent = salaActual;

  actualizarProgresoComp(0);
  renderCompQrGrid();
}

function renderCompQrGrid() {
  const grid = document.getElementById('compQrGrid');
  grid.innerHTML = '';
  const total = ejercicioComp.pistas.length;
  for (let i = 0; i < total; i++) {
    const num = i + 1;
    const resuelto = progresoComp.includes(num);
    const esCurrent = !resuelto && progresoComp.length === i;
    const locked = !resuelto && progresoComp.length < i;

    const item = document.createElement('div');
    item.className = `qr-item ${resuelto ? 'solved' : ''} ${locked ? 'locked' : ''} ${esCurrent ? 'current' : ''}`;
    item.innerHTML = `
      <div class="qr-item-num">QR ${num}</div>
      <div class="qr-item-icon">${resuelto ? '✅' : locked ? '🔒' : '📱'}</div>
      <div class="qr-item-label">${resuelto ? 'Resuelto' : locked ? 'Bloqueado' : 'Activo'}</div>
    `;
    if (!locked && !resuelto) item.onclick = () => abrirResolverComp(num);
    grid.appendChild(item);
  }
}

async function abrirResolverComp(num) {
  const pista = ejercicioComp.pistas.find(p => p.numero === num);
  if (!pista) return;
  pistaCompActual = num;

  const qrRes = await API.generarQR({ ejercicioId: ejercicioComp.id, pistaNumero: num });
  if (qrRes.success && qrRes.qr) {
    document.getElementById('qrImage').src = qrRes.qr;
    document.getElementById('qrModalTitle').textContent = `QR #${num}`;
    document.getElementById('qrModalDesc').textContent = pista.descripcion;
    document.getElementById('qrModal').classList.remove('hidden');
    setTimeout(() => document.getElementById('qrModal').classList.add('hidden'), 2500);
  }

  document.getElementById('compResolverNum').textContent = `QR #${num}`;
  document.getElementById('compResolverDesc').textContent = pista.descripcion;
  document.getElementById('compResolverPregunta').textContent = pista.pregunta;
  document.getElementById('compResolverPista').textContent = `💡 Pista: ${pista.pista || 'Analiza el enunciado'}`;
  document.getElementById('compResolverInput').value = '';
  document.getElementById('compResolverFeedback').classList.add('hidden');
  document.getElementById('compResolverPanel').style.display = 'block';
  document.getElementById('compResolverInput').focus();
}

async function verificarRespuestaComp() {
  const respuesta = document.getElementById('compResolverInput').value.trim();
  if (!respuesta) { toast('Escribe una respuesta', 'error'); return; }

  const res = await API.verificar({ ejercicioId: ejercicioComp.id, pistaNumero: pistaCompActual, respuesta });
  const feedback = document.getElementById('compResolverFeedback');
  feedback.classList.remove('hidden', 'ok', 'err');

  if (res.correcto) {
    feedback.textContent = `✅ ¡Correcto! +${res.puntos || 5} puntos`;
    feedback.classList.add('ok');
    progresoComp.push(pistaCompActual);
    actualizarProgresoComp(progresoComp.length);

    const user = window.getCurrentUser();
    socket.emit('qr-resuelto', {
      codigoSala: salaActual,
      userId: user._id,
      username: user.username,
      nombre: user.nombre,
      pistaNumero: pistaCompActual
    });

    setTimeout(() => {
      document.getElementById('compResolverPanel').style.display = 'none';
      renderCompQrGrid();
      if (progresoComp.length < ejercicioComp.pistas.length) {
        setTimeout(() => abrirResolverComp(pistaCompActual + 1), 500);
      }
    }, 1000);
  } else {
    feedback.textContent = res.message || '❌ Fórmula incorrecta. ¡Intenta de nuevo!';
    feedback.classList.add('err');
    const user = window.getCurrentUser();
    socket.emit('intento-incorrecto', { codigoSala: salaActual, userId: user._id, pistaNumero: pistaCompActual });
  }
}

function cerrarCompResolver() {
  document.getElementById('compResolverPanel').style.display = 'none';
}

function actualizarProgresoComp(resueltos) {
  const total = ejercicioComp?.pistas?.length || 20;
  document.getElementById('compProgActual').textContent = resueltos;
  document.getElementById('compProgressBar').style.width = `${(resueltos / total) * 100}%`;
}

function actualizarMarcador(participantes) {
  const user = window.getCurrentUser();
  const sorted = [...participantes].sort((a, b) => b.qrResueltos - a.qrResueltos);
  const list = document.getElementById('marcadorList');
  list.innerHTML = sorted.map((p, i) => `
    <div class="marcador-item ${p.username === user?.username ? 'yo' : ''}">
      <div class="marcador-pos">${i + 1}</div>
      <div style="flex:1">
        <div class="marcador-nombre">${p.nombre} ${p.terminado ? '🏆' : ''} ${p.username === user?.username ? '(Tú)' : ''}</div>
        <div class="marcador-progress"><div class="marcador-progress-fill" style="width:${(p.qrResueltos/20)*100}%"></div></div>
      </div>
      <div class="marcador-qr">${p.qrResueltos}/20</div>
    </div>
  `).join('');
}

function mostrarPantallaFin(ganadores, participantes) {
  document.getElementById('comp-juego').classList.add('hidden');
  document.getElementById('comp-fin').classList.remove('hidden');

  const podio = document.getElementById('podio');
  const emojis = ['🥇', '🥈', '🥉'];
  const orden = [1, 0, 2]; // 2do, 1ro, 3ro para podio visual

  const ganadoresOrdenados = ganadores.sort((a, b) => a.posicion - b.posicion);
  const podioItems = orden.map(i => ganadoresOrdenados[i]).filter(Boolean);

  podio.innerHTML = podioItems.map((g, idx) => `
    <div class="podio-lugar">
      <div class="podio-emoji">${emojis[orden[idx]]}</div>
      <div class="podio-plataforma">
        <div class="podio-nombre">${g?.nombre || '—'}</div>
        <div class="podio-tiempo">${g ? formatTiempo(g.tiempo) : ''}</div>
      </div>
    </div>
  `).join('');

  const sorted = [...participantes].sort((a, b) => {
    if (a.terminado && !b.terminado) return -1;
    if (!a.terminado && b.terminado) return 1;
    if (a.terminado && b.terminado) return (a.posicionFinal || 99) - (b.posicionFinal || 99);
    return b.qrResueltos - a.qrResueltos;
  });

  document.getElementById('resultadosTable').innerHTML = `
    <div class="resultados-row header">
      <div class="r-pos">#</div>
      <div class="r-nombre">Jugador</div>
      <div class="r-qr">QR</div>
    </div>
    ${sorted.map((p, i) => `
      <div class="resultados-row">
        <div class="r-pos">${i + 1}</div>
        <div class="r-nombre">${p.nombre} ${p.terminado ? '✅' : ''}</div>
        <div class="r-qr">${p.qrResueltos}/20</div>
      </div>
    `).join('')}
  `;

  salirSala();
}

function volverCompMenu() {
  document.getElementById('comp-fin').classList.add('hidden');
  document.getElementById('comp-menu').classList.remove('hidden');
  document.getElementById('panelCrear').classList.add('hidden');
  document.getElementById('panelUnirse').classList.add('hidden');
  salaActual = null;
  ejercicioComp = null;
  progresoComp = [];
}

function salirSala() {
  if (socket && salaActual) socket.disconnect();
  socket = null;
}

function formatTiempo(segundos) {
  if (!segundos) return '—';
  const m = Math.floor(segundos / 60);
  const s = segundos % 60;
  return `${m}m ${s}s`;
}

function formatCategoriaComp(cat) {
  const map = { nomina_empresa: 'Nómina', tienda: 'Tienda', trabajadores: 'Trabajadores', prestaciones: 'Prestaciones', impuestos: 'Impuestos', seguridad_social: 'Seg. Social' };
  return map[cat] || cat;
}

window.mostrarCrearSala = mostrarCrearSala;
window.mostrarUnirseSala = mostrarUnirseSala;
window.crearSala = crearSala;
window.unirseSala = unirseSala;
window.copiarCodigo = copiarCodigo;
window.iniciarPartidaComp = iniciarPartidaComp;
window.cerrarCompResolver = cerrarCompResolver;
window.verificarRespuestaComp = verificarRespuestaComp;
window.volverCompMenu = volverCompMenu;
window.salirSala = salirSala;
