const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db/database");

const JWT_SECRET = process.env.JWT_SECRET || "subastup_secret_dev";
const JWT_EXPIRES = process.env.JWT_EXPIRES || "7d";

// ─── POST /api/auth/register ─────────────────────────────────────────────────
const register = (req, res) => {
  const { document, name, address, email, password, countryId, category } = req.body;

  if (!document || !name || !email || !password) {
    return res.status(400).json({ error: "document, name, email y password son obligatorios." });
  }

  // Verificar email único
  const existing = db.prepare("SELECT id FROM people WHERE email = ?").get(email);
  if (existing) {
    return res.status(409).json({ error: "El email ya está registrado." });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  // Insertar en people
  const personResult = db
    .prepare(
      `INSERT INTO people (document, name, address, status, email, password)
       VALUES (?, ?, ?, 'active', ?, ?)`
    )
    .run(document, name, address || null, email, hashedPassword);

  const personId = personResult.lastInsertRowid;

  // Para poder insertar en clients necesitamos un verifier_id válido.
  // En un sistema real esto vendría de un empleado asignado.
  // Por ahora usamos el primer empleado disponible; si no hay ninguno,
  // el registro queda solo en people y el cliente se crea luego.
  const firstEmployee = db.prepare("SELECT id FROM employees LIMIT 1").get();

  if (firstEmployee) {
    db.prepare(
      `INSERT INTO clients (id, country_id, admitted, category, verifier_id)
       VALUES (?, ?, 0, ?, ?)`
    ).run(personId, countryId || null, category || "common", firstEmployee.id);
  }

  const token = jwt.sign({ id: personId, role: "client" }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES,
  });

  return res.status(201).json({
    message: "Registro exitoso.",
    token,
    user: { id: personId, name, email, role: "client" },
  });
};

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
const login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email y password son obligatorios." });
  }

  // Buscar persona por email
  const person = db
    .prepare("SELECT id, name, email, password, status FROM people WHERE email = ?")
    .get(email);

  if (!person) {
    return res.status(401).json({ error: "Credenciales inválidas." });
  }

  if (person.status === "inactive") {
    return res.status(403).json({ error: "Cuenta inactiva. Contactá al administrador." });
  }

  const passwordValid = bcrypt.compareSync(password, person.password);
  if (!passwordValid) {
    return res.status(401).json({ error: "Credenciales inválidas." });
  }

  // Verificar que sea cliente
  const client = db.prepare("SELECT id, category, admitted FROM clients WHERE id = ?").get(person.id);
  if (!client) {
    return res.status(403).json({ error: "El usuario no tiene rol de cliente." });
  }

  const token = jwt.sign(
    { id: person.id, role: "client", category: client.category },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );

  return res.status(200).json({
    message: "Login exitoso.",
    token,
    user: {
      id: person.id,
      name: person.name,
      email: person.email,
      role: "client",
      category: client.category,
      admitted: client.admitted === 1,
    },
  });
};

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
const me = (req, res) => {
  const person = db
    .prepare("SELECT id, name, email, document, address, status FROM people WHERE id = ?")
    .get(req.user.id);

  if (!person) return res.status(404).json({ error: "Usuario no encontrado." });

  const client = db
    .prepare("SELECT category, admitted, country_id FROM clients WHERE id = ?")
    .get(person.id);

  return res.status(200).json({ ...person, ...client, role: "client" });
};

module.exports = { register, login, me };
