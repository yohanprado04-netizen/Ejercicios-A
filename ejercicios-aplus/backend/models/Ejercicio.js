const mongoose = require('mongoose');

const pistaSchema = new mongoose.Schema({
  numero: { type: Number, required: true }, // 1-20
  descripcion: { type: String, required: true },
  pregunta: { type: String, required: true },
  respuestaCorrecta: { type: String, required: true }, // formula o valor exacto
  respuestasAlternativas: [String], // otras formas válidas
  pista: { type: String }, // ayuda adicional
  tipo: { type: String, enum: ['formula', 'valor', 'texto'], default: 'formula' },
  puntos: { type: Number, default: 5 }
});

const ejercicioSchema = new mongoose.Schema({
  id: { type: Number, unique: true, required: true },
  titulo: { type: String, required: true },
  categoria: {
    type: String,
    enum: ['nomina_empresa', 'tienda', 'trabajadores', 'prestaciones', 'impuestos', 'seguridad_social'],
    required: true
  },
  descripcionGeneral: { type: String, required: true },
  nivel: { type: String, enum: ['basico', 'intermedio', 'avanzado'], default: 'intermedio' },
  datos: { type: mongoose.Schema.Types.Mixed }, // datos del caso (salarios, horas, etc.)
  pistas: [pistaSchema], // 20 pistas/pasos
  activo: { type: Boolean, default: true },
  vecesJugado: { type: Number, default: 0 },
  vecesCompletado: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Ejercicio', ejercicioSchema);
