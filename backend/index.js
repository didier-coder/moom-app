import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import reservations from "./routes/reservations.js";
import disponibilites from "./routes/disponibilites.js";
import fermetures from "./routes/fermetures.js";

dotenv.config();

console.log("🚀 [Moom Backend] Démarrage du serveur sécurisé...");

const app = express();
const PORT = process.env.PORT || 5000;
const heuresRoutes = require("./routes/heures");

/* -------------------------------------------
   🔐 Configuration CORS (pour Vercel + local)
-------------------------------------------- */
const allowedOrigins = [
    "https://app.moom.be", // Domaine principal
    "https://moom-app.vercel.app", // Backend déployé
    "https://moom-app-pvq4.vercel.app", // Frontend déployé
    "http://localhost:3000", // Dev local
];

const vercelPreview = /^https:\/\/moom-[a-z0-9-]+\.vercel\.app$/i;

app.use(
    cors({
        origin: function(origin, callback) {
            if (!origin || allowedOrigins.includes(origin) || vercelPreview.test(origin)) {
                callback(null, true);
            } else {
                console.warn("❌ Origine non autorisée par CORS :", origin);
                callback(new Error("Not allowed by CORS"));
            }
        },
        credentials: true,
    })
);

app.use(express.json());

/* -------------------------------------------
   ✅ Route de test /api/ping
-------------------------------------------- */
app.get("/api/ping", (req, res) => {
    console.log("✅ /api/ping appelé !");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).send("pong 🧩");
});

/* -------------------------------------------
   📦 Routes principales
-------------------------------------------- */
app.use("/api/reservations", reservations);
app.use("/api/disponibilites", disponibilites);
app.use("/api/fermetures", fermetures);
app.use("/api/heures", heuresRoutes);

/* -------------------------------------------
   ⚠️ Gestion des 404
-------------------------------------------- */
app.use((req, res) => {
    console.warn("⚠️ Route inconnue :", req.originalUrl);
    res.status(404).send("Not found");
});

/* -------------------------------------------
   🚀 Lancement du serveur
-------------------------------------------- */
app.listen(PORT, () => {
    console.log(`✅ Serveur actif sur le port ${PORT}`);
    console.log("🌍 Environnement :", process.env.NODE_ENV || "local");
});