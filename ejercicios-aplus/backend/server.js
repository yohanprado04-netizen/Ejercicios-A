require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/database');
const QRCode = require('qrcode');

// Models
const Partida = require('./models/Partida');
const Ejercicio = require('./models/Ejercicio');
const User = require('./models/User');

const app = express();
const server = http.createServer(app);

// Socket.IO config
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, '../frontend')));

// DB Connect
connectDB();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/ejercicios', require('./routes/ejercicios'));
app.use('/api/partidas', require('./routes/partidas'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date(), db: 'EjerciciosAmas' });
});

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ============================================================
// SOCKET.IO - LÓGICA EN TIEMPO REAL
// ============================================================

const salasActivas = new Map(); // codigoSala -> { usuarios, estado }

io.on('connection', (socket) => {
  console.log(`🔌 Socket conectado: ${socket.id}`);

  // Unirse a sala de competencia
  socket.on('unirse-sala', async ({ codigoSala, userId, username, nombre }) => {
    try {
      const partida = await Partida.findOne({ codigoSala: codigoSala.toUpperCase() });
      if (!partida) {
        socket.emit('error-sala', { message: 'Sala no encontrada' });
        return;
      }

      socket.join(codigoSala);
      socket.data = { codigoSala, userId, username, nombre };

      // Actualizar estado conectado
      await Partida.updateOne(
        { codigoSala, 'participantes.userId': userId },
        { $set: { 'participantes.$.conectado': true, 'participantes.$.ultimaActividad': new Date() } }
      );

      const participantes = partida.participantes.map(p => ({
        username: p.username,
        nombre: p.nombre,
        qrResueltos: p.qrResueltos,
        terminado: p.terminado,
        conectado: p.conectado
      }));

      io.to(codigoSala).emit('actualizacion-sala', {
        participantes,
        estado: partida.estado,
        ejercicioId: partida.ejercicioId,
        message: `${nombre} se unió a la sala`
      });

      socket.emit('sala-info', {
        codigoSala,
        estado: partida.estado,
        ejercicioId: partida.ejercicioId,
        participantes,
        esDueno: partida.creadoPor?.toString() === userId
      });

      console.log(`👤 ${username} unido a sala ${codigoSala}`);
    } catch (err) {
      socket.emit('error-sala', { message: err.message });
    }
  });

  // Iniciar partida (solo el dueño)
  socket.on('iniciar-partida', async ({ codigoSala, userId }) => {
    try {
      const partida = await Partida.findOne({ codigoSala });
      if (!partida) return;
      if (partida.creadoPor?.toString() !== userId) {
        socket.emit('error-sala', { message: 'Solo el creador puede iniciar' });
        return;
      }
      partida.estado = 'jugando';
      partida.fechaInicio = new Date();
      await partida.save();

      io.to(codigoSala).emit('partida-iniciada', {
        ejercicioId: partida.ejercicioId,
        fechaInicio: partida.fechaInicio,
        message: '¡La partida comenzó!'
      });
    } catch (err) {
      socket.emit('error-sala', { message: err.message });
    }
  });

  // QR resuelto
  socket.on('qr-resuelto', async ({ codigoSala, userId, username, nombre, pistaNumero }) => {
    try {
      const partida = await Partida.findOne({ codigoSala });
      if (!partida || partida.estado !== 'jugando') return;

      const participante = partida.participantes.find(p => p.userId.toString() === userId);
      if (!participante) return;

      // Verificar que no haya resuelto este QR antes
      const yaResuelto = participante.progreso.find(p => p.numero === pistaNumero && p.resuelto);
      if (yaResuelto) return;

      const tiempoResolucion = Math.floor((Date.now() - new Date(partida.fechaInicio).getTime()) / 1000);

      participante.progreso.push({ numero: pistaNumero, resuelto: true, tiempoResolucion, intentos: 1 });
      participante.qrResueltos = participante.progreso.filter(p => p.resuelto).length;
      participante.ultimaActividad = new Date();

      // ¿Ganó?
      if (participante.qrResueltos >= 20) {
        participante.terminado = true;
        participante.tiempoTotal = tiempoResolucion;

        // Asignar posición
        const terminados = partida.participantes.filter(p => p.terminado).length;
        participante.posicionFinal = terminados;

        if (terminados <= 3) {
          partida.ganadores.push({
            posicion: terminados,
            userId: participante.userId,
            username: participante.username,
            nombre: participante.nombre,
            tiempo: tiempoResolucion,
            qrResueltos: 20
          });
        }

        // ¿Todos terminaron o hay 3 ganadores?
        if (terminados === 3 || partida.participantes.every(p => p.terminado)) {
          partida.estado = 'terminada';
          partida.fechaFin = new Date();
        }

        // Actualizar historial del usuario
        await User.updateOne({ _id: userId }, {
          $push: {
            historialPartidas: {
              partidaId: partida._id.toString(),
              fecha: new Date(),
              tipo: 'competencia',
              ejercicioId: partida.ejercicioId,
              qrResueltos: 20,
              posicion: participante.posicionFinal,
              ganada: participante.posicionFinal === 1,
              tiempoTotal: tiempoResolucion,
              codigoSala
            }
          },
          $inc: {
            totalPartidasJugadas: 1,
            totalQrResueltos: 20,
            totalVictorias: participante.posicionFinal === 1 ? 1 : 0,
            puntajeTotal: 100 - (participante.posicionFinal - 1) * 10
          }
        });
      }

      await partida.save();

      const participantes = partida.participantes.map(p => ({
        username: p.username,
        nombre: p.nombre,
        qrResueltos: p.qrResueltos,
        terminado: p.terminado,
        posicionFinal: p.posicionFinal,
        conectado: p.conectado
      }));

      io.to(codigoSala).emit('progreso-actualizado', {
        participantes,
        ultimoEvento: {
          username,
          nombre,
          pistaNumero,
          qrResueltos: participante.qrResueltos
        }
      });

      if (partida.estado === 'terminada') {
        io.to(codigoSala).emit('partida-terminada', {
          ganadores: partida.ganadores,
          participantes
        });
      } else if (participante.terminado) {
        io.to(codigoSala).emit('jugador-termino', {
          username,
          nombre,
          posicion: participante.posicionFinal,
          tiempo: tiempoResolucion
        });
      }

    } catch (err) {
      console.error('Error qr-resuelto:', err);
    }
  });

  // Intento incorrecto (para contabilizar)
  socket.on('intento-incorrecto', async ({ codigoSala, userId, pistaNumero }) => {
    try {
      await Partida.updateOne(
        { codigoSala, 'participantes.userId': userId },
        { $inc: { 'participantes.$.progreso.$[].intentos': 0 } }
      );
    } catch (_) {}
  });

  // Desconexión
  socket.on('disconnect', async () => {
    const { codigoSala, userId, username } = socket.data || {};
    if (codigoSala && userId) {
      try {
        await Partida.updateOne(
          { codigoSala, 'participantes.userId': userId },
          { $set: { 'participantes.$.conectado': false } }
        );
        io.to(codigoSala).emit('jugador-desconectado', { username });
      } catch (_) {}
    }
    console.log(`🔌 Socket desconectado: ${socket.id}`);
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor Ejercicios A+ en puerto ${PORT}`);
  console.log(`📦 DB: EjerciciosAmas`);
  console.log(`🌐 Frontend: ${process.env.FRONTEND_URL || 'http://localhost:' + PORT}`);
});

module.exports = { app, server };
