const mongoose = require('mongoose');

const participanteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String, required: true },
  nombre: { type: String, required: true },
  qrResueltos: { type: Number, default: 0 },
  progreso: [{ // cada QR con su estado
    numero: Number,
    resuelto: Boolean,
    tiempoResolucion: Number, // segundos desde inicio
    intentos: { type: Number, default: 0 }
  }],
  posicionFinal: { type: Number, default: null },
  terminado: { type: Boolean, default: false },
  tiempoTotal: { type: Number, default: null },
  conectado: { type: Boolean, default: true },
  ultimaActividad: { type: Date, default: Date.now }
});

const partidaSchema = new mongoose.Schema({
  codigoSala: { type: String, unique: true, required: true },
  tipo: { type: String, enum: ['individual', 'competencia'], default: 'competencia' },
  ejercicioId: { type: Number, required: true },
  estado: {
    type: String,
    enum: ['esperando', 'jugando', 'terminada'],
    default: 'esperando'
  },
  participantes: [participanteSchema],
  maxParticipantes: { type: Number, default: 50 },
  creadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  fechaInicio: { type: Date, default: null },
  fechaFin: { type: Date, default: null },
  ganadores: [{ // top 3
    posicion: Number,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    username: String,
    nombre: String,
    tiempo: Number,
    qrResueltos: Number
  }],
  configuracion: {
    tiempoLimite: { type: Number, default: null }, // minutos, null = sin limite
    permitirNuevos: { type: Boolean, default: false } // unirse durante partida
  },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Partida', partidaSchema);
