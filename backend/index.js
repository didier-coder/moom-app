import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";

import disponibilites from "./routes/disponibilites.js";
import heures from "./routes/heures.js";
import fermetures from "./routes/fermetures.js";
import reservations from "./routes/reservations.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ✅ CORS avec autorisation des sous-domaines moom.be
const allowedOrigins = [
    "http://localhost:3000",
    "https://app.moom.be",
    "https://www.app.moom.be",
    "https://moom-frontend.vercel.app",
    "https://moom-app.vercel.app",
    "https://moom-backend-clean.vercel.app"
];

app.use(cors({
    origin: function(origin, callback) {
        console.log("🌐 Requête CORS depuis :", origin);
        if (!origin || allowedOrigins.includes(origin) || /\.moom\.be$/.test(origin)) {
            callback(null, true);
        } else {
            console.warn(`❌ CORS refusé pour : ${origin}`);
            callback(new Error(`Non autorisé par CORS : ${origin}`));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());
app.use(morgan("dev"));

app.use("/api/disponibilites", disponibilites);
app.use("/api/heures", heures);
app.use("/api/fermetures", fermetures);
app.use("/api/reservations", reservations);

app.get("/api/ping", (req, res) => {
    res.json({ message: "pong 🧩 serveur backend actif !" });
});

app.listen(PORT, () => {
    console.log(`✅ Serveur en écoute sur le port ${PORT}`);
});