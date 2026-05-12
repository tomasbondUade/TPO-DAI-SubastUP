const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth.routes");

const app = express();

app.use(cors());
app.use(express.json());

// Rutas
app.use("/api/auth", authRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({ status: "SubastUp API running" });
});

module.exports = app;
