import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

console.log("🚀 [Moom Backend] Démarrage du serveur sécurisé...");

const app = express();
const PORT = process.env.PORT || 5000;

// --- CORS basique temporaire ---
app.use(cors());
app.use(express.json());

// --- Test simple ---
app.get("/api/ping", (req, res) => {
    console.log("✅ /api/ping appelé !");
    res.status(200).send("pong 🧩");
});


import heuresRoutes from "./routes/heures.js";


app.use("/api/heures", heuresRoutes);


app.use((req, res) => {
    res.status(404).send("Not found");
});

app.listen(PORT, () => {
    console.log(`✅ Serveur actif sur le port ${PORT}`);
});