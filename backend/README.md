# SubastUp – Backend API

Backend REST con Node.js + Express + SQLite (better-sqlite3) + JWT.

## Estructura

```
backend/
├── src/
│   ├── server.js                  # Entry point
│   ├── app.js                     # Express app
│   ├── db/
│   │   └── database.js            # Conexión SQLite + creación de tablas
│   ├── controllers/
│   │   └── auth.controller.js     # Lógica de register / login / me
│   ├── middlewares/
│   │   └── auth.middleware.js     # Verificación de JWT
│   └── routes/
│       └── auth.routes.js         # Rutas de autenticación
├── .env.example
└── package.json
```

## Instalación

```bash
cd backend
npm install
cp .env.example .env   # Editá JWT_SECRET
npm run dev            # Desarrollo con nodemon
npm start              # Producción
```

## Endpoints

### POST /api/auth/register
Registra un nuevo cliente.

**Body:**
```json
{
  "document": "12345678",
  "name": "Juan Pérez",
  "email": "juan@mail.com",
  "password": "miPassword123",
  "address": "Calle Falsa 123",   // opcional
  "countryId": 1,                 // opcional
  "category": "common"            // opcional, default: "common"
}
```

**Respuesta 201:**
```json
{
  "message": "Registro exitoso.",
  "token": "<JWT>",
  "user": { "id": 1, "name": "Juan Pérez", "email": "juan@mail.com", "role": "client" }
}
```

---

### POST /api/auth/login
Inicia sesión con email y contraseña.

**Body:**
```json
{
  "email": "juan@mail.com",
  "password": "miPassword123"
}
```

**Respuesta 200:**
```json
{
  "message": "Login exitoso.",
  "token": "<JWT>",
  "user": {
    "id": 1,
    "name": "Juan Pérez",
    "email": "juan@mail.com",
    "role": "client",
    "category": "common",
    "admitted": false
  }
}
```

---

### GET /api/auth/me
Devuelve el perfil del usuario autenticado.

**Header:** `Authorization: Bearer <JWT>`

**Respuesta 200:**
```json
{
  "id": 1,
  "name": "Juan Pérez",
  "email": "juan@mail.com",
  "document": "12345678",
  "address": "Calle Falsa 123",
  "status": "active",
  "category": "common",
  "admitted": 0,
  "country_id": null,
  "role": "client"
}
```

## Notas

- La DB SQLite se crea automáticamente en `backend/database.sqlite` al iniciar.
- Los campos `email` y `password` se agregaron a la tabla `people`.
- Las contraseñas se hashean con **bcryptjs** (salt 10).
- El JWT dura **7 días** por defecto (configurable en `.env`).
- `PRAGMA foreign_keys = ON` está activo en cada conexión.
