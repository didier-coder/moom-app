import express from "express";
import supabase from "../db.js";
import { v4 as uuidv4 } from "uuid";
import QRCode from "qrcode";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const router = express.Router();

// ✅ Fonction d’envoi d’emails
const sendConfirmationEmails = async ({ email, name, date, heure, personnes, service }) => {
  try {
    // --- Mail client ---
    await resend.emails.send({
      from: "Moom <no-reply@moom.be>",
      to: email,
      subject: "Confirmation de votre réservation",
      html: `
        <h2>Bonjour ${name},</h2>
        <p>Nous avons bien enregistré votre réservation au restaurant <strong>Moom</strong>.</p>
        <p>🗓️ Date : <strong>${date}</strong><br/>
           🕒 Heure : <strong>${heure}</strong><br/>
           👥 Nombre de personnes : <strong>${personnes}</strong><br/>
           🍽️ Service : <strong>${service}</strong></p>
        <p>À très bientôt,<br>L’équipe du restaurant Moom</p>
      `,
    });

    // --- Mail restaurateur ---
    await resend.emails.send({
      from: "Moom <no-reply@moom.be>",
      to: "business@moom.be",
      subject: "📥 Nouvelle réservation reçue",
      html: `
        <h3>Nouvelle réservation :</h3>
        <p><strong>Nom :</strong> ${name}</p>
        <p><strong>Email :</strong> ${email}</p>
        <p><strong>Date :</strong> ${date}</p>
        <p><strong>Heure :</strong> ${heure}</p>
        <p><strong>Personnes :</strong> ${personnes}</p>
        <p><strong>Service :</strong> ${service}</p>
      `,
    });

    console.log("📧 Emails envoyés avec succès !");
  } catch (err) {
    console.error("❌ Erreur lors de l’envoi d’e-mails :", err);
  }
};

// ✅ Route principale de création de réservation
router.post("/", async (req, res) => {
  try {
    const { prenom, nom, email, date, heure, personnes, service } = req.body;
    const name = `${prenom} ${nom}`.trim();
    const id = uuidv4();

    const qrData = `Réservation #${id} - ${name} - ${date} - ${heure}`;
    const qrCodeBase64 = await QRCode.toDataURL(qrData);

    const { error } = await supabase
      .from("reservations")
      .insert([{ id, name, email, date, heure, personnes, service, qrcode: qrCodeBase64 }]);

    if (error) throw error;

    await sendConfirmationEmails({ email, name, date, heure, personnes, service });

    res.status(201).json({ success: true, qrCode: qrCodeBase64 });
  } catch (err) {
    console.error("❌ Erreur POST /api/reservations :", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Route de lecture (GET)
router.get("/", async (req, res) => {
  const { data, error } = await supabase.from("reservations").select("*");
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ✅ Export du routeur pour Express
export default router;


