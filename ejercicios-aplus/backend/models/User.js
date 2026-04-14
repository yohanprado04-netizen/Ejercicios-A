const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const historialPartidaSchema = new mongoose.Schema({
  partidaId: { type: String, required: true },
  fecha: { type: Date, default: Date.now },
  tipo: { type: String, enum: ['individual', 'competencia'], default: 'individual' },
  ejercicioId: { type: Number },
  qrResueltos: { type: Number, default: 0 },
  posicion: { type: Number, default: null },
  ganada: { type: Boolean, default: false },
  tiempoTotal: { type: Number, default: 0 }, // segundos
  codigoSala: { type: String, default: null }
});

const userSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true,
    minlength: [3, 'Mínimo 3 caracteres'],
    maxlength: [50, 'Máximo 50 caracteres']
  },
  username: {
    type: String,
    required: [true, 'El nombre de usuario es requerido'],
    unique: true,
    trim: true,
    lowercase: true,
    minlength: [3, 'Mínimo 3 caracteres'],
    maxlength: [30, 'Máximo 30 caracteres']
  },
  password: {
    type: String,
    required: [true, 'La contraseña es requerida'],
    minlength: [4, 'Mínimo 4 caracteres']
  },
  avatar: {
    type: String,
    default: null
  },
  historialPartidas: [historialPartidaSchema],
  totalPartidasJugadas: { type: Number, default: 0 },
  totalQrResueltos: { type: Number, default: 0 },
  totalVictorias: { type: Number, default: 0 },
  puntajeTotal: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  ultimaConexion: { type: Date, default: Date.now }
}, { timestamps: true });

// Hash password antes de guardar
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Comparar contraseñas
userSchema.methods.compararPassword = async function(passwordIngresada) {
  return await bcrypt.compare(passwordIngresada, this.password);
};

// No exponer password
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
