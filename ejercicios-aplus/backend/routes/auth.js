const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Registro
router.post('/register', async (req, res) => {
  try {
    const { nombre, username, password } = req.body;
    if (!nombre || !username || !password) {
      return res.status(400).json({ success: false, message: 'Todos los campos son requeridos' });
    }
    const existe = await User.findOne({ username: username.toLowerCase() });
    if (existe) {
      return res.status(400).json({ success: false, message: 'El nombre de usuario ya existe' });
    }
    const user = new User({ nombre, username: username.toLowerCase(), password });
    await user.save();
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ success: true, message: 'Usuario creado exitosamente', token, user: user.toJSON() });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Usuario y contraseña requeridos' });
    }
    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
    }
    const valido = await user.compararPassword(password);
    if (!valido) {
      return res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
    }
    user.ultimaConexion = new Date();
    await user.save();
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, message: 'Sesión iniciada', token, user: user.toJSON() });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Perfil
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, user: user.toJSON() });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Historial
router.get('/historial', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('historialPartidas nombre username');
    res.json({ success: true, historial: user.historialPartidas.reverse() });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
