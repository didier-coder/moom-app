import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

console.log("🚀 [Moom Backend] Démarrage du serveur sécurisé...");

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware CORS sécurisé ---
const allowedOrigins = [
    "https://app.moom.be",
    "https://moom-app-pvq4.vercel.app",
    "https://moom-app.vercel.app",
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