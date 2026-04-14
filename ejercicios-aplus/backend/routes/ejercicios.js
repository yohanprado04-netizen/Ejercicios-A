const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const Ejercicio = require('../models/Ejercicio');
const auth = require('../middleware/auth');

// Obtener ejercicio aleatorio
router.get('/aleatorio', auth, async (req, res) => {
  try {
    const count = await Ejercicio.countDocuments({ activo: true });
    const random = Math.floor(Math.random() * count);
    const ejercicio = await Ejercicio.findOne({ activo: true }).skip(random);
    if (!ejercicio) return res.status(404).json({ success: false, message: 'No hay ejercicios disponibles' });
    // No enviar respuestas al frontend
    const ejercicioSeguro = {
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
    res.json({ success: true, ejercicio: ejercicioSeguro });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Obtener ejercicio por ID (sin respuestas)
router.get('/:id', auth, async (req, res) => {
  try {
    const ejercicio = await Ejercicio.findOne({ id: parseInt(req.params.id), activo: true });
    if (!ejercicio) return res.status(404).json({ success: false, message: 'Ejercicio no encontrado' });
    const ejercicioSeguro = {
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
    res.json({ success: true, ejercicio: ejercicioSeguro });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Verificar respuesta
router.post('/verificar', auth, async (req, res) => {
  try {
    const { ejercicioId, pistaNumero, respuesta } = req.body;
    const ejercicio = await Ejercicio.findOne({ id: parseInt(ejercicioId) });
    if (!ejercicio) return res.status(404).json({ success: false, message: 'Ejercicio no encontrado' });
    const pista = ejercicio.pistas.find(p => p.numero === parseInt(pistaNumero));
    if (!pista) return res.status(404).json({ success: false, message: 'Pista no encontrada' });

    const respuestaNormalizada = respuesta.trim().toLowerCase().replace(/\s+/g, '');
    const correctaNormalizada = pista.respuestaCorrecta.trim().toLowerCase().replace(/\s+/g, '');
    const alternativas = (pista.respuestasAlternativas || []).map(r => r.trim().toLowerCase().replace(/\s+/g, ''));

    const esCorrecta = respuestaNormalizada === correctaNormalizada || alternativas.includes(respuestaNormalizada);

    if (esCorrecta) {
      // Actualizar estadísticas del ejercicio
      await Ejercicio.updateOne({ id: parseInt(ejercicioId) }, { $inc: { vecesJugado: 1 } });
      res.json({ success: true, correcto: true, message: '¡Respuesta correcta! 🎉', puntos: pista.puntos });
    } else {
      res.json({ success: true, correcto: false, message: '❌ Fórmula incorrecta. ¡Intenta de nuevo!' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Generar QR para una pista
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

    res.json({ success: true, qr: qrBase64, pista: {
      numero: pista.numero,
      descripcion: pista.descripcion,
      pregunta: pista.pregunta,
      pista: pista.pista,
      tipo: pista.tipo
    }});
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;