import express from "express";
import supabase from "../db.js";
import { v4 as uuidv4 } from "uuid";
import QRCode from "qrcode";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const router = express.Router();

// 🧠 Fonction d'envoi d'e-mails
async function sendConfirmationEmails({ name, email, date, qrCodeBase64 }) {
  try {
    // ✉️ Email au client
    await resend.emails.send({
      from: "Moom <no-reply@moom.be>",
      to: email,
      subject: "✅ Confirmation de votre réservation chez Moom",
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2>Merci ${name},</h2>
          <p>Votre réservation chez <strong>Moom</strong> a bien été enregistrée :</p>
          <ul>
            <li><strong>Date :</strong> ${date}</li>
          </ul>
          <p>Voici votre QR Code de confirmation :</p>
          <img src="${qrCodeBase64}" alt="QR Code" width="120" height="120" />
          <p>Nous avons hâte de vous accueillir 🍽️</p>
          <p style="font-size:12px;color:#999;">Cet email est automatique, merci de ne pas y répondre.</p>
        </div>
      `,
    });

    // ✉️ Email au restaurateur
    await resend.emails.send({
      from: "Moom Réservations <no-reply@moom.be>",
      to: "info@moom.be", // <-- adresse du resto
      subject: "📩 Nouvelle réservation reçue",
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h3>Nouvelle réservation :</h3>
          <ul>
            <li><strong>Nom :</strong> ${name}</li>
            <li><strong>Email :</strong> ${email}</li>
            <li><strong>Date :</strong> ${date}</li>
          </ul>
          <p>QR Code associé :</p>
          <img src="${qrCodeBase64}" alt="QR Code" width="120" height="120" />
        </div>
      `,
    });

    console.log("📧 Emails envoyés avec succès !");
  } catch (err) {
    console.error("❌ Erreur lors de l'envoi des e-mails :", err);
  }
}

// 🚀 Route POST — nouvelle réservation
router.post("/", async (req, res) => {
  try {
    const { name, email, date } = req.body;

    const id = uuidv4();
    const qrData = `Réservation #${id} - ${name} - ${date}`;
    const qrCodeBase64 = await QRCode.toDataURL(qrData);

    const { error } = await supabase
      .from("reservations")
      .insert([{ id, name, email, date, qrcode: qrCodeBase64 }]);

    if (error) throw error;

    // ✅ Envoi des e-mails après insertion réussie
    await sendConfirmationEmails({ name, email, date, qrCodeBase64 });

    res.status(201).json({ success: true, qrCode: qrCodeBase64 });
  } catch (err) {
    console.error("Erreur lors de la création de la réservation :", err);
    res.status(500).json({ error: err.message });
  }
});

// 🚀 Route GET — liste des réservations
router.get("/", async (req, res) => {
  const { data, error } = await supabase.from("reservations").select("*");
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

export default router;

