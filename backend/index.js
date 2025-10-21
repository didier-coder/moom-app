import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

console.log("🚀 [Moom Backend] Serveur Express en cours de démarrage...");

// --- Initialisation ---
const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Test simple ---
app.get("/api/ping", (req, res) => {
    console.log("✅ /api/ping appelé !");
    res.status(200).send("pong 🧩");
});

// --- Routes principales ---
import reservations from "./routes/reservations.js";
import disponibilites from "./routes/disponibilites.js";
import fermetures from "./routes/fermetures.js";

app.use("/api/reservations", reservations);
app.use("/api/disponibilites", disponibilites);
app.use("/api/fermetures", fermetures);

// --- Erreur 404 ---
app.use((req, res) => {
    console.warn("❌ Route inconnue :", req.originalUrl);
    res.status(404).send("Not found");
});

// --- Lancement ---
app.listen(PORT, () => {
    console.log(`✅ Serveur actif sur le port ${PORT}`);
    console.log("🌍 Environnement :", process.env.NODE_ENV || "local");
});