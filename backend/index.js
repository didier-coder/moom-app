import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import compression from "compression";
import morgan from "morgan";
import reservations from "./routes/reservations.js";
import disponibilites from "./routes/disponibilites.js";
import logger from "./utils/logger.js";
import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 🧱 Désactive complètement le cache HTTP
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("Surrogate-Control", "no-store");
  next();
});

// 🌐 Middlewares essentiels
app.use(cors());
app.use(express.json());
app.use(compression());
app.use(morgan("tiny"));

// ✅ Test Render
app.get("/api/ping", (req, res) => {
  res.status(200).send("pong");
});

// 📅 Routes principales
app.use("/api/reservations", reservations);
app.use("/api/disponibilites", disponibilites);

// 🧪 Test du middleware d’erreur (doit être AVANT celui-ci)
app.get("/api/test-error", (req, res, next) => {
  try {
    throw new Error("Ceci est un test d’erreur volontaire 💥");
  } catch (err) {
    next(err);
  }
});

// 🚨 Middleware global d’erreur avec envoi d’alerte HTML
app.use(async (err, req, res, next) => {
  const errorDate = new Date().toLocaleString("fr-BE");
  const errorMessage = `
    🔥 Une erreur est survenue sur le serveur Moom :

    🧩 Route : ${req.originalUrl}
    🕒 Heure : ${errorDate}
    💬 Message : ${err.message}

    Stack :
    ${err.stack}
  `;

  // 🧾 Log local + Render console
  logger.error(errorMessage);
  console.error(err.stack);

  // 📧 Envoi de l’alerte email
  try {
    await resend.emails.send({
      from: "Moom <onboarding@resend.dev>", // ✅ tu peux remplacer plus tard par noreply@moom.be
      to: "info@moom.be",
      subject: "🚨 Erreur serveur Moom",
      html: `
        <div style="font-family: Arial, sans-serif; background: #f7f9fc; padding: 20px;">
          <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 10px; padding: 20px; border: 1px solid #e0e0e0;">
            <h2 style="color: #e63946;">🔥 Une erreur est survenue sur le serveur Moom</h2>
            <p><strong>🧩 Route :</strong> ${req.originalUrl}</p>
            <p><strong>🕒 Heure :</strong> ${errorDate}</p>
            <p><strong>💬 Message :</strong> ${err.message}</p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;" />
            <pre style="background: #f8f9fa; padding: 10px; border-radius: 8px; border: 1px solid #ddd; white-space: pre-wrap; font-size: 13px;">
${err.stack}
            </pre>
          </div>
          <p style="text-align: center; color: #666; margin-top: 15px; font-size: 12px;">
            © ${new Date().getFullYear()} Restaurant Moom - Notification automatique
          </p>
        </div>
      `,
    });
    logger.info("📧 Alerte d’erreur envoyée à info@moom.be ✅");
  } catch (mailError) {
    logger.error("❌ Échec de l’envoi de l’alerte email :", mailError);
  }

  // 🔙 Réponse au client
  res.status(500).json({
    success: false,
    message: "Erreur interne du serveur",
  });
});


// 🔍 Vérification Supabase
logger.info("🔑 SUPABASE URL: " + (process.env.SUPABASE_URL ? "✅ Présente" : "❌ Manquante"));
logger.info("🔑 SUPABASE KEY: " + (process.env.SUPABASE_ANON_KEY ? "✅ Présente" : "❌ Manquante"));

// 🚀 Lancement du serveur
app.listen(PORT, () => {
  logger.info(`✅ Serveur actif sur le port ${PORT}`);
});


