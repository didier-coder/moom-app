import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import compression from "compression";
import morgan from "morgan";
import reservations from "./routes/reservations.js";
import disponibilites from "./routes/disponibilites.js";

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

// 🔍 Vérification des variables Supabase
console.log("🔑 SUPABASE URL:", process.env.SUPABASE_URL ? "✅ Présente" : "❌ Manquante");
console.log("🔑 SUPABASE KEY:", process.env.SUPABASE_ANON_KEY ? "✅ Présente" : "❌ Manquante");

// 🚀 Lancement du serveur
app.listen(PORT, () => {
  console.log(`✅ Serveur actif sur le port ${PORT}`);
});

