const express = require("express");
const router = express.Router();
const { register, login, me } = require("../controllers/auth.controller");
const { authenticate } = require("../middlewares/auth.middleware");

// POST /api/auth/register
router.post("/register", register);

// POST /api/auth/login
router.post("/login", login);

// GET /api/auth/me  (requiere token)
router.get("/me", authenticate, me);

module.exports = router;
