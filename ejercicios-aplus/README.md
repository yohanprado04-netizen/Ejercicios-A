# 🎓 Ejercicios A+ — Sistema Educativo de Nóminas

## Descripción
Plataforma web educativa para aprender cálculos de nóminas empresariales en Excel. Incluye:
- 1.000 ejercicios aleatorios sobre nóminas, tiendas y trabajadores
- Sistema de 20 QR por ejercicio con verificación de fórmulas
- Modo práctica individual
- Modo competencia en tiempo real (Socket.IO)
- Historial completo de partidas
- Base de datos MongoDB: **EjerciciosAmas**

---

## 🛠️ Tecnologías
- **Backend:** Node.js + Express + Socket.IO + Mongoose
- **Frontend:** HTML5 + CSS3 + JavaScript Vanilla
- **Base de datos:** MongoDB Atlas (DB: `EjerciciosAmas`)
- **Deploy:** Render.com

---

## 🚀 Despliegue en Render

### 1. Subir a GitHub
```bash
git init
git add .
git commit -m "Initial commit - Ejercicios A+"
git remote add origin https://github.com/TU_USUARIO/ejercicios-aplus.git
git push -u origin main
```

### 2. Crear servicio en Render
1. Ve a [render.com](https://render.com) → New → Web Service
2. Conecta tu repositorio GitHub
3. Configura:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install && node seed.js`
   - **Start Command:** `node server.js`
4. Variables de entorno:
   - `MONGODB_URI` = `mongodb+srv://yohanprado04_db_user:pradera123@prado04.t4d8ob8.mongodb.net/?retryWrites=true&w=majority&appName=prado04`
   - `JWT_SECRET` = `ejerciciosAplus_super_secret_key_2024_nominas_colombia`
   - `NODE_ENV` = `production`
   - `FRONTEND_URL` = `https://tu-app.onrender.com` (cambia por tu URL real)

### 3. (Opcional) Sembrar ejercicios manualmente
```bash
cd backend
npm install
node seed.js
```

---

## 💻 Desarrollo Local

```bash
# 1. Instalar dependencias
cd backend
npm install

# 2. Configurar .env (ya incluido, ajusta si necesitas)
# El archivo .env ya tiene las credenciales de producción

# 3. Sembrar ejercicios
node seed.js

# 4. Iniciar servidor
npm start
# o en modo desarrollo:
npm run dev

# 5. Abrir en navegador
# http://localhost:3000
```

---

## 📁 Estructura del Proyecto

```
ejercicios-aplus/
├── backend/
│   ├── config/
│   │   ├── database.js          # Conexión MongoDB → EjerciciosAmas
│   │   └── ejerciciosSeed.js    # Generador de 1000 ejercicios
│   ├── middleware/
│   │   └── auth.js              # JWT middleware
│   ├── models/
│   │   ├── User.js              # Usuarios con historial
│   │   ├── Ejercicio.js         # 1000 ejercicios con 20 pistas c/u
│   │   └── Partida.js           # Salas de competencia
│   ├── routes/
│   │   ├── auth.js              # /api/auth/*
│   │   ├── ejercicios.js        # /api/ejercicios/*
│   │   └── partidas.js          # /api/partidas/*
│   ├── server.js                # Express + Socket.IO
│   ├── seed.js                  # Script para sembrar DB
│   ├── .env                     # Variables de entorno
│   └── package.json
├── frontend/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── api.js               # Cliente HTTP
│   │   ├── auth.js              # Login/Register
│   │   ├── practica.js          # Modo práctica
│   │   ├── competencia.js       # Modo competencia (Socket.IO)
│   │   ├── historial.js         # Historial de partidas
│   │   ├── ui.js                # Utilidades UI
│   │   └── app.js               # Inicialización
│   └── index.html
├── render.yaml                  # Config deploy Render
└── README.md
```

---

## 🗄️ Base de Datos: EjerciciosAmas

### Colecciones:
| Colección | Documentos | Descripción |
|-----------|-----------|-------------|
| `users` | Variable | Usuarios + historial de partidas |
| `ejercicios` | 1.000 | Ejercicios con 20 pistas cada uno |
| `partidas` | Variable | Salas de competencia con progreso en tiempo real |

---

## 🎮 Cómo Usar

### Práctica Individual
1. Crea cuenta o inicia sesión
2. Ve a **Práctica** → Nuevo Ejercicio Aleatorio
3. Aparece un grid de 20 QR — el primero está activo
4. Haz clic en el QR → se muestra la pregunta con fórmula de Excel
5. Escribe la respuesta correcta → se desbloquea el siguiente QR
6. Si la fórmula es incorrecta → muestra error y puedes intentar de nuevo
7. Al resolver los 20 QR → ¡Ejercicio completado! 🏆

### Competencia en Tiempo Real
1. **Crear Sala:** Ve a Competencia → Crear Sala → Copia el código
2. **Unirse:** Otros estudiantes ingresan el código de 6 letras
3. El creador presiona **Iniciar Partida**
4. Todos resuelven el MISMO ejercicio simultáneamente
5. El marcador se actualiza en tiempo real
6. El primero en resolver los 20 QR gana 🥇
7. Se muestran los 3 primeros lugares en el podio

---

## 📊 Ejercicios Incluidos

Los 1.000 ejercicios cubren:
- **Nómina Empresarial** — Salario, auxilio transporte, horas extras, seguridad social
- **Tienda Comercial** — Comisiones, prestaciones proporcionales
- **Liquidación de Trabajadores** — Cesantías, prima, vacaciones, indemnización
- **Prestaciones Sociales** — Cálculos completos según la ley colombiana
- **Impuestos** — Retención en la fuente
- **Seguridad Social** — EPS, pensión, ARL, parafiscales

Cada ejercicio usa fórmulas reales de **Microsoft Excel** aplicadas a nóminas de Colombia (ley laboral colombiana).

---

## ⚖️ Marco Legal (Colombia)
- Salario mínimo 2024: $1.300.000
- Auxilio de transporte: $162.000
- Salud empleado: 4% | Empleador: 8.5%
- Pensión: 4% empleado | 12% empleador
- Parafiscales: SENA 2% + ICBF 3% + Caja 4%
- Cesantías: 8.33% | Intereses: 12% anual
- Prima: 8.33% | Vacaciones: 4.17%
