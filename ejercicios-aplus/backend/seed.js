require('dotenv').config();
const mongoose = require('mongoose');
const Ejercicio = require('./models/Ejercicio');
const { generarEjercicios } = require('./config/ejerciciosSeed');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: 'EjerciciosAmas' });
    console.log('✅ Conectado a MongoDB - DB: EjerciciosAmas');

    const count = await Ejercicio.countDocuments();
    if (count > 0) {
      console.log(`⚠️  Ya existen ${count} ejercicios. Eliminando para re-sembrar...`);
      await Ejercicio.deleteMany({});
    }

    const ejercicios = generarEjercicios();
    console.log(`📝 Generando ${ejercicios.length} ejercicios...`);

    // Insertar en lotes de 100
    for (let i = 0; i < ejercicios.length; i += 100) {
      const lote = ejercicios.slice(i, i + 100);
      await Ejercicio.insertMany(lote);
      console.log(`✅ Lote ${Math.floor(i/100)+1}/10 insertado (${i + lote.length} ejercicios)`);
    }

    console.log(`🎉 ${ejercicios.length} ejercicios sembrados exitosamente en EjerciciosAmas`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en seed:', error);
    process.exit(1);
  }
}

seed();
