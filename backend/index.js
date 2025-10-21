console.log("🚀 [Moom Backend] Démarrage du serveur...");
console.log("📦 Node version :", process.version);
console.log("📂 Working directory :", process.cwd());
console.log("🔍 Environnement :", process.env.NODE_ENV);

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import compression from "compression";
import morgan from "morgan";
import reservations from "./routes/reservations.js";
import disponibilites from "./routes/disponibilites.js";
import fermetures from "./routes/fermetures.js";
import logger from "./utils/logger.js";
import { Resend } from "resend";

dotenv.config();

import dotenv from "dotenv";
dotenv.config();

console.log("🧠 Variables d’environnement chargées :");
console.log({
  SUPABASE_URL: !!process.env.SUPABASE_URL,
  SUPABASE_KEY: !!process.env.SUPABASE_ANON_KEY,
  RESEND_API_KEY: !!process.env.RESEND_API_KEY,
});


// 🧱 Initialisation du serveur Express
const app = express();
const PORT = process.env.PORT || 5000;

// 🛡️ Configuration CORS explicite
const allowedOrigins = [
  "https://app.moom.be",                // ton domaine principal
  "https://moom-app-pvq4.vercel.app",   // ton domaine Vercel (optionnel)
  "http://localhost:3000"               // utile pour tests locaux
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn("❌ Origine non autorisée par CORS :", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// 🩵 Ajout manuel des headers CORS (sécurité + compatibilité)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://app.moom.be");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// 🌐 Middlewares essentiels
app.use(express.json());
app.use(compression());
app.use(morgan("tiny"));

// 🧱 Désactive complètement le cache HTTP
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("Surrogate-Control", "no-store");
  next();
});

const resend = new Resend(process.env.RESEND_API_KEY);

// ✅ Test Render / Ping
app.get("/api/ping", (req, res) => {
  res.status(200).send("pong");
});

// 📅 Routes principales
app.use("/api/reservations", reservations);
app.use("/api/disponibilites", disponibilites);
app.use("/api/fermetures", fermetures);

// 🧩 Route test d’erreur
app.get("/api/test-error", (req, res, next) => {
  const key = req.query.key;
  if (key !== process.env.ADMIN_KEY) {
    return res.status(404).json({
      success: false,
      message: "Ressource non trouvée 🕵️‍♂️",
    });
  }
  next(new Error("Ceci est un test d’erreur volontaire 💥"));
});

// 🚨 Middleware global d’erreur
app.use(async (err, req, res, next) => {
  const errorDate = new Date().toLocaleString("fr-BE");
  logger.error(`🔥 Erreur sur ${req.originalUrl} à ${errorDate}: ${err.message}`);
  console.error(err.stack);

  try {
    await new Resend(process.env.RESEND_API_KEY).emails.send({
      from: "Moom <info@moom.be>",
      to: "info@moom.be",
      subject: "🚨 Erreur serveur Moom",
      html: `<p><strong>Route :</strong> ${req.originalUrl}</p><p><strong>Erreur :</strong> ${err.message}</p><pre>${err.stack}</pre>`
    });
  } catch (mailError) {
    logger.error("❌ Échec de l’envoi de l’alerte email :", mailError);
  }

  res.status(500).json({ success: false, message: "Erreur interne du serveur" });
});

// 🔍 Vérification Supabase
logger.info("🔑 SUPABASE URL: " + (process.env.SUPABASE_URL ? "✅ Présente" : "❌ Manquante"));
logger.info("🔑 SUPABASE KEY: " + (process.env.SUPABASE_ANON_KEY ? "✅ Présente" : "❌ Manquante"));
console.log(`✅ Serveur Express prêt sur le port ${PORT}`);

// 🚀 Lancement du serveur
app.listen(PORT, () => {
  logger.info(`✅ Serveur actif sur le port ${PORT}`);
});
