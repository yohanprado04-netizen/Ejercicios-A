const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const Ejercicio = require('../models/Ejercicio');
const auth = require('../middleware/auth');

// ============================================================
//  UTILIDAD: verificación flexible de respuestas
// ============================================================
function normalizar(str) {
  return str
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')            // quitar espacios
    .replace(/\$/g, '')             // quitar signo $
    .replace(/\./g, '')             // quitar puntos de miles
    .replace(/,/g, '.')             // coma decimal → punto
    .replace(/%/g, '')              // quitar %
    .replace(/=/g, '')              // quitar = inicial
    .replace(/pesos/g, '')
    .replace(/cop/g, '');
}

function esCorrecta(respuesta, correcta, alternativas = []) {
  const r = normalizar(respuesta);
  const c = normalizar(correcta);

  if (r === c) return true;

  // Comparar con alternativas
  for (const alt of alternativas) {
    if (r === normalizar(alt)) return true;
  }

  // Comparación numérica tolerante (±1% de diferencia)
  const rNum = parseFloat(r.replace(/[^0-9.]/g, ''));
  const cNum = parseFloat(c.replace(/[^0-9.]/g, ''));
  if (!isNaN(rNum) && !isNaN(cNum) && cNum !== 0) {
    const diff = Math.abs((rNum - cNum) / cNum);
    if (diff <= 0.01) return true;
  }

  // Comparación de porcentajes: "4%" vs "4" vs "0.04"
  if (!isNaN(rNum) && !isNaN(cNum)) {
    if (Math.abs(rNum - cNum) < 0.0001) return true;
    if (Math.abs(rNum - cNum * 100) < 0.01) return true;
    if (Math.abs(rNum * 100 - cNum) < 0.01) return true;
  }

  return false;
}

// ============================================================
//  Obtener ejercicio aleatorio
// ============================================================
router.get('/aleatorio', auth, async (req, res) => {
  try {
    const count = await Ejercicio.countDocuments({ activo: true });
    const random = Math.floor(Math.random() * count);
    const ejercicio = await Ejercicio.findOne({ activo: true }).skip(random);
    if (!ejercicio) return res.status(404).json({ success: false, message: 'No hay ejercicios disponibles' });

    const ejercicioSeguro = buildEjercicioSeguro(ejercicio);
    res.json({ success: true, ejercicio: ejercicioSeguro });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================
//  Verificar respuesta — con verificación flexible
// ============================================================
router.post('/verificar', auth, async (req, res) => {
  try {
    const { ejercicioId, pistaNumero, respuesta } = req.body;
    const ejercicio = await Ejercicio.findOne({ id: parseInt(ejercicioId) });
    if (!ejercicio) return res.status(404).json({ success: false, message: 'Ejercicio no encontrado' });

    const pista = ejercicio.pistas.find(p => p.numero === parseInt(pistaNumero));
    if (!pista) return res.status(404).json({ success: false, message: 'Pista no encontrada' });

    const correcto = esCorrecta(respuesta, pista.respuestaCorrecta, pista.respuestasAlternativas || []);

    if (correcto) {
      await Ejercicio.updateOne({ id: parseInt(ejercicioId) }, { $inc: { vecesJugado: 1 } });
      res.json({ success: true, correcto: true, message: '¡Respuesta correcta! 🎉', puntos: pista.puntos });
    } else {
      // Después de 3 intentos dar pista extra (se puede implementar con contador en frontend)
      res.json({
        success: true,
        correcto: false,
        message: '❌ Respuesta incorrecta. ¡Revisa la pista y vuelve a intentarlo!',
        pista: pista.pista  // ← enviamos la pista para que el frontend la muestre
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================
//  Pista adicional — nueva ruta para mostrar ejemplo tras varios intentos
// ============================================================
router.post('/pista-extra', auth, async (req, res) => {
  try {
    const { ejercicioId, pistaNumero } = req.body;
    const ejercicio = await Ejercicio.findOne({ id: parseInt(ejercicioId) });
    if (!ejercicio) return res.status(404).json({ success: false, message: 'No encontrado' });

    const pista = ejercicio.pistas.find(p => p.numero === parseInt(pistaNumero));
    if (!pista) return res.status(404).json({ success: false, message: 'Pista no encontrada' });

    // Revelar el FORMATO de la respuesta esperada (no la respuesta exacta)
    const tipo = pista.tipo;
    let formatoEjemplo = '';
    if (tipo === 'formula') {
      formatoEjemplo = 'Escribe una fórmula Excel, ej: =SUMA(A1:A5) o =salario*4%';
    } else if (tipo === 'valor') {
      formatoEjemplo = 'Escribe solo el valor, ej: 1300000 o 4% o 8.5';
    } else {
      formatoEjemplo = 'Escribe tu respuesta en texto breve';
    }

    res.json({
      success: true,
      pista: pista.pista,
      alternativas: pista.respuestasAlternativas,
      formatoEjemplo
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================
//  Generar QR
// ============================================================
router.post('/generar-qr', auth, async (req, res) => {
  try {
    const { ejercicioId, pistaNumero } = req.body;
    const ejercicio = await Ejercicio.findOne({ id: parseInt(ejercicioId) });
    if (!ejercicio) return res.status(404).json({ success: false, message: 'Ejercicio no encontrado' });
    const pista = ejercicio.pistas.find(p => p.numero === parseInt(pistaNumero));
    if (!pista) return res.status(404).json({ success: false, message: 'Pista no encontrada' });

    const baseUrl = process.env.FRONTEND_URL || 'https://ejercicios-a.onrender.com';
    const qrData = `${baseUrl}/?ej=${ejercicioId}&p=${pistaNumero}&t=${Date.now()}`;
    const qrBase64 = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 2,
      color: { dark: '#1a1a2e', light: '#ffffff' },
      errorCorrectionLevel: 'M'
    });

    res.json({
      success: true,
      qr: qrBase64,
      pista: {
        numero: pista.numero,
        descripcion: pista.descripcion,
        pregunta: pista.pregunta,
        pista: pista.pista,
        tipo: pista.tipo
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================
//  Obtener ejercicio por ID
// ============================================================
router.get('/:id', auth, async (req, res) => {
  try {
    const ejercicio = await Ejercicio.findOne({ id: parseInt(req.params.id), activo: true });
    if (!ejercicio) return res.status(404).json({ success: false, message: 'Ejercicio no encontrado' });
    res.json({ success: true, ejercicio: buildEjercicioSeguro(ejercicio) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================
//  Helper
// ============================================================
function buildEjercicioSeguro(ejercicio) {
  return {
    id: ejercicio.id,
    titulo: ejercicio.titulo,
    categoria: ejercicio.categoria,
    descripcionGeneral: ejercicio.descripcionGeneral,
    nivel: ejercicio.nivel,
    datos: ejercicio.datos,
    totalPistas: ejercicio.pistas.length,
    pistas: ejercicio.pistas.map(p => ({
      numero: p.numero,
      descripcion: p.descripcion,
      pregunta: p.pregunta,
      pista: p.pista,
      tipo: p.tipo,
      puntos: p.puntos
    }))
  };
}

module.exports = router;