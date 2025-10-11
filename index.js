import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// ⚠️ Ne pas activer dotenv sur Render (optionnel si tu l’utilises localement)
// dotenv.config();

import reservations from "./routes/reservations.js";
import disponibilites from "./routes/disponibilites.js";

// --- Création du serveur Express ---
const app = express();

app.use(cors());
app.use(express.json());

// --- Routes ---
app.use("/api/reservations", reservations);
app.use("/api/disponibilites", disponibilites);

// --- Vérification Supabase ---
console.log("🔑 SUPABASE URL:", process.env.SUPABASE_URL ? "✅ Présente" : "❌ Manquante");
console.log("🔑 SUPABASE KEY:", process.env.SUPABASE_ANON_KEY ? "✅ Présente" : "❌ Manquante");

// --- Démarrage du serveur ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Serveur actif sur le port ${PORT}`);
});
