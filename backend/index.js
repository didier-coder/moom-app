import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import compression from "compression";
import morgan from "morgan";
import reservations from "./routes/reservations.js";
import disponibilites from "./routes/disponibilites.js";
import logger from "./utils/logger.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 🧱 Désactive complètement le cache HTTP (anti-cache total : navigateur + proxy + CDN)
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("Surrogate-Control", "no-store");
  next();
});

// ⚡ Compression GZIP pour améliorer les performances mobiles
app.use(compression());

// 🧾 Journalisation des requêtes simplifiée
app.use(morgan("tiny"));

// 🌐 Middlewares essentiels
app.use(cors());
app.use(express.json());

// ✅ Route de test Render (health check)
app.get("/api/ping", (req, res) => {
  res.status(200).send("pong");
});

// 📅 Routes principales
app.use("/api/reservations", reservations);
app.use("/api/disponibilites", disponibilites);

// 🧪 Route de test du middleware d’erreur
app.get("/api/test-error", (req, res, next) => {
  try {
    throw new Error("Ceci est un test d’erreur volontaire 💥");
  } catch (err) {
    next(err);
  }
});

// 🚨 Middleware global de gestion des erreurs
app.use((err, req, res, next) => {
  logger.error(`🔥 Erreur serveur : ${err.message}`);
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Erreur interne du serveur",
  });
});

// 🔍 Vérification des variables Supabase
logger.info("🔑 SUPABASE URL: " + (process.env.SUPABASE_URL ? "✅ Présente" : "❌ Manquante"));
logger.info("🔑 SUPABASE KEY: " + (process.env.SUPABASE_ANON_KEY ? "✅ Présente" : "❌ Manquante"));

// 🚀 Lancement du serveur
app.listen(PORT, () => {
  logger.info(`✅ Serveur actif sur le port ${PORT}`);
});

