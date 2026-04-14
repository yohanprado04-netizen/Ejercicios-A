const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'EjerciciosAmas',
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ MongoDB conectado: ${conn.connection.host} | DB: EjerciciosAmas`);
  } catch (error) {
    console.error('❌ Error al conectar MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
