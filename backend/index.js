import express from "express";
import cors from "cors";

console.log("🚀 [Moom Backend] Test de serveur minimal lancé...");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware CORS simple
app.use(cors());

// Test route
app.get("/api/ping", (req, res) => {
  console.log("✅ Requête /api/ping reçue !");
  res.status(200).send("pong 🧩");
});

// Catch-all pour tester les routes
app.use((req, res) => {
  console.log("❌ Route inconnue :", req.originalUrl);
  res.status(404).send("Not found");
});

// Démarrage serveur
app.listen(PORT, () => {
  console.log(`✅ Serveur Express opérationnel sur le port ${PORT}`);
});
