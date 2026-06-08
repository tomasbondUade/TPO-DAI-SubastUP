// server.js
<<<<<<< HEAD
// Punto de entrada del backend

=======
>>>>>>> desarrollo
require('dotenv').config();

const express = require('express');
const cors    = require('cors');
<<<<<<< HEAD
const { getPool } = require('./config/db');
=======
const prisma  = require('./config/prisma');
>>>>>>> desarrollo

const app  = express();
const PORT = process.env.PORT || 3000;

<<<<<<< HEAD
// ── Middlewares globales ──────────────────────────────────────
app.use(cors());                           // Permitir requests desde la app móvil
app.use(express.json({ limit: '10mb' })); // Body parser JSON (soporta fotos en base64)
app.use(express.urlencoded({ extended: true }));

// ── Rutas ─────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));

// ── Health check ──────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ ok: true, server: 'SubastaAPI', ts: new Date() }));

// ── 404 ───────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ ok: false, message: 'Ruta no encontrada.' }));

// ── Error handler global ──────────────────────────────────────
=======
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', require('./routes/auth'));

app.get('/health', (_req, res) => res.json({ ok: true, server: 'SubastaAPI', ts: new Date() }));

app.use((_req, res) => res.status(404).json({ ok: false, message: 'Ruta no encontrada.' }));

>>>>>>> desarrollo
app.use((err, _req, res, _next) => {
  console.error('Error no manejado:', err);
  res.status(500).json({ ok: false, message: 'Error interno del servidor.' });
});

<<<<<<< HEAD
// ── Iniciar ───────────────────────────────────────────────────
(async () => {
  try {
    await getPool();                       // Verificar conexión a la BD al arrancar
=======
(async () => {
  try {
    await prisma.$connect();
    console.log('✅  Conectado a PostgreSQL: subastup');
>>>>>>> desarrollo
    app.listen(PORT, () => {
      console.log(`🚀  Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌  No se pudo conectar a la base de datos:', err.message);
    process.exit(1);
  }
})();
