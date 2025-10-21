import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

console.log("🚀 [Moom Backend] Démarrage du serveur sécurisé...");

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Route test ---
app.get("/api/ping", (req, res) => {
    console.log("✅ /api/ping appelé !");
    res.status(200).send("pong 🧩");
});

// --- Chargement sécurisé des routes ---
try {
    const reservations = await
    import ("./routes/reservations.js");
    app.use("/api/reservations", reservations.default);
    console.log("✅ Route /api/reservations chargée !");
} catch (err) {
    console.error("❌ Erreur chargement /api/reservations :", err.message);
}

try {
    const disponibilites = await
    import ("./routes/disponibilites.js");
    app.use("/api/disponibilites", disponibilites.default);
    console.log("✅ Route /api/disponibilites chargée !");
} catch (err) {
    console.error("❌ Erreur chargement /api/disponibilites :", err.message);
}

try {
    const fermetures = await
    import ("./routes/fermetures.js");
    app.use("/api/fermetures", fermetures.default);
    console.log("✅ Route /api/fermetures chargée !");
} catch (err) {
    console.error("❌ Erreur chargement /api/fermetures :", err.message);
}

// --- 404 ---
app.use((req, res) => {
    console.warn("⚠️ Route inconnue :", req.originalUrl);
    res.status(404).send("Not found");
});

// --- Lancement ---
app.listen(PORT, () => {
    console.log(`✅ Serveur actif sur le port ${PORT}`);
    console.log("🌍 Environnement :", process.env.NODE_ENV || "local");
});