import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

console.log("🚀 [Moom Backend] Démarrage du serveur sécurisé...");

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware CORS ---
const allowedOrigins = [
    "https://app.moom.be",
    "https://moom-app.vercel.app",
    "https://moom-app-pvq4.vercel.app",
    "https://moom-5jtdwse73-didier-s-projects-d07f62d5.vercel.app",
    "http://localhost:3000"
];

app.use(
    cors({
        origin: function(origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
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

// --- Route test ---
app.get("/api/ping", (req, res) => {
    console.log("✅ /api/ping appelé !");
    res.setHeader("Access-Control-Allow-Origin", "*");
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