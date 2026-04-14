// historial.js
async function cargarHistorial() {
  const listEl = document.getElementById('historialList');
  const statsEl = document.getElementById('historialStats');
  listEl.innerHTML = '<div class="loading-state">Cargando historial...</div>';

  const res = await API.historial();
  if (!res.success) { listEl.innerHTML = '<div class="loading-state">Error al cargar historial</div>'; return; }

  const h = res.historial || [];
  const user = window.getCurrentUser();

  // Stats
  const ganadas = h.filter(p => p.ganada).length;
  const totalQR = h.reduce((s, p) => s + (p.qrResueltos || 0), 0);
  const completadas = h.filter(p => p.qrResueltos >= 20).length;
  const competencias = h.filter(p => p.tipo === 'competencia').length;

  statsEl.innerHTML = `
    <div class="hstat-card"><span class="hstat-num">${h.length}</span><div class="hstat-label">Total Partidas</div></div>
    <div class="hstat-card"><span class="hstat-num">${ganadas}</span><div class="hstat-label">🏆 Victorias</div></div>
    <div class="hstat-card"><span class="hstat-num">${totalQR}</span><div class="hstat-label">QR Resueltos</div></div>
    <div class="hstat-card"><span class="hstat-num">${competencias}</span><div class="hstat-label">Competencias</div></div>
  `;

  if (h.length === 0) {
    listEl.innerHTML = '<div class="loading-state">Aún no tienes partidas registradas. ¡Comienza a jugar!</div>';
    return;
  }

  listEl.innerHTML = h.map(p => {
    const fecha = new Date(p.fecha).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    const completada = (p.qrResueltos || 0) >= 20;
    const cardClass = p.ganada ? 'ganada' : completada ? '' : 'perdida';
    const tipoIcon = p.tipo === 'competencia' ? '⚡' : '📚';
    const posText = p.posicion ? `Puesto #${p.posicion}` : '';
    const tiempoText = p.tiempoTotal ? `${Math.floor(p.tiempoTotal / 60)}m ${p.tiempoTotal % 60}s` : '—';

    return `
      <div class="partida-card ${cardClass}">
        <div class="partida-tipo">${tipoIcon}</div>
        <div class="partida-info">
          <div class="partida-titulo">${p.tipo === 'competencia' ? 'Competencia' : 'Práctica Individual'}${p.codigoSala ? ` — Sala: ${p.codigoSala}` : ''}</div>
          <div class="partida-meta">${fecha}${posText ? ' · ' + posText : ''}${p.ganada ? ' · 🏆 Ganada' : ''}</div>
        </div>
        <div class="partida-stats">
          <div class="partida-stat">
            <div class="partida-stat-num" style="color:var(--accent)">${p.qrResueltos || 0}/20</div>
            <div class="partida-stat-label">QR</div>
          </div>
          <div class="partida-stat">
            <div class="partida-stat-num">${tiempoText}</div>
            <div class="partida-stat-label">Tiempo</div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

window.cargarHistorial = cargarHistorial;
