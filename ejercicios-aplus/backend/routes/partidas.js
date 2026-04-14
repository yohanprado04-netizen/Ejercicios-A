const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const Partida = require('../models/Partida');
const Ejercicio = require('../models/Ejercicio');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Generar código de sala único
function generarCodigo() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Crear sala de competencia
router.post('/crear', auth, async (req, res) => {
  try {
    const { tiempoLimite } = req.body;
    // Ejercicio aleatorio
    const count = await Ejercicio.countDocuments({ activo: true });
    const random = Math.floor(Math.random() * count);
    const ejercicio = await Ejercicio.findOne({ activo: true }).skip(random);

    let codigo;
    let existe = true;
    while (existe) {
      codigo = generarCodigo();
      existe = await Partida.findOne({ codigoSala: codigo, estado: { $ne: 'terminada' } });
    }

    const partida = new Partida({
      codigoSala: codigo,
      tipo: 'competencia',
      ejercicioId: ejercicio.id,
      creadoPor: req.user._id,
      configuracion: { tiempoLimite: tiempoLimite || null, permitirNuevos: false }
    });

    // Añadir creador como primer participante
    partida.participantes.push({
      userId: req.user._id,
      username: req.user.username,
      nombre: req.user.nombre,
      qrResueltos: 0,
      progreso: []
    });

    await partida.save();
    res.json({ success: true, message: 'Sala creada', codigoSala: codigo, partidaId: partida._id });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Unirse a sala
router.post('/unirse', auth, async (req, res) => {
  try {
    const { codigoSala } = req.body;
    const partida = await Partida.findOne({ codigoSala: codigoSala.toUpperCase(), estado: { $in: ['esperando', 'jugando'] } });
    if (!partida) return res.status(404).json({ success: false, message: 'Sala no encontrada o ya finalizada' });
    if (partida.participantes.length >= partida.maxParticipantes) {
      return res.status(400).json({ success: false, message: 'La sala está llena' });
    }
    const yaEsta = partida.participantes.find(p => p.userId.toString() === req.user._id.toString());
    if (!yaEsta) {
      partida.participantes.push({
        userId: req.user._id,
        username: req.user.username,
        nombre: req.user.nombre,
        qrResueltos: 0,
        progreso: []
      });
      await partida.save();
    }
    res.json({ success: true, message: 'Te uniste a la sala', codigoSala, ejercicioId: partida.ejercicioId, estado: partida.estado });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Obtener info de sala
router.get('/sala/:codigo', auth, async (req, res) => {
  try {
    const partida = await Partida.findOne({ codigoSala: req.params.codigo.toUpperCase() });
    if (!partida) return res.status(404).json({ success: false, message: 'Sala no encontrada' });
    res.json({ success: true, partida: {
      codigoSala: partida.codigoSala,
      estado: partida.estado,
      ejercicioId: partida.ejercicioId,
      participantes: partida.participantes.map(p => ({
        username: p.username,
        nombre: p.nombre,
        qrResueltos: p.qrResueltos,
        terminado: p.terminado,
        conectado: p.conectado
      })),
      ganadores: partida.ganadores,
      fechaInicio: partida.fechaInicio,
      fechaFin: partida.fechaFin
    }});
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Iniciar partida (solo el creador)
router.post('/iniciar/:codigo', auth, async (req, res) => {
  try {
    const partida = await Partida.findOne({ codigoSala: req.params.codigo.toUpperCase(), estado: 'esperando' });
    if (!partida) return res.status(404).json({ success: false, message: 'Sala no encontrada' });
    if (partida.creadoPor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Solo el creador puede iniciar la partida' });
    }
    partida.estado = 'jugando';
    partida.fechaInicio = new Date();
    await partida.save();
    res.json({ success: true, message: 'Partida iniciada' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
