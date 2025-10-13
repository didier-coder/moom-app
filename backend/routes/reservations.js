import express from "express";
import supabase from "../db.js";
import { v4 as uuidv4 } from "uuid";
import QRCode from "qrcode";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const router = express.Router();

async function sendConfirmationEmails({ email, name, date, heure, personnes, service }) {
  const restaurantEmail = "contact@moom.be";

  const clientHtml = `
  <div style="font-family: 'Lato', sans-serif; background-color: #f9f9f9; padding: 40px;">
    <div style="max-width: 600px; margin: auto; background: white; border-radius: 14px; box-shadow: 0 4px 25px rgba(0,0,0,0.05); overflow: hidden;">
      <div style="background-color: #fff7ef; padding: 20px 30px; border-bottom: 1px solid #f0e0d0;">
        <img src="https://res.cloudinary.com/dv3z6wo7v/image/upload/v1739397352/moom-logo.png" alt="Moom" style="width:120px; display:block; margin:auto;" />
      </div>
      <div style="padding: 35px;">
        <h2 style="color: #222; text-align:center;">Merci pour votre réservation !</h2>
        <p style="font-size:16px; color:#555; text-align:center;">
          Bonjour <strong>${name}</strong>, nous avons bien enregistré votre réservation au restaurant <strong>Moom</strong>.
        </p>
        <div style="margin:30px 0; border:1px solid #eee; border-radius:10px; padding:20px; background:#fafafa;">
          <p><strong>📅 Date :</strong> ${date}</p>
          <p><strong>🕒 Heure :</strong> ${heure}</p>
          <p><strong>👥 Nombre de personnes :</strong> ${personnes}</p>
          <p><strong>🍽️ Service :</strong> ${service === "lunch" ? "Midi" : "Soir"}</p>
        </div>
        <p style="text-align:center; color:#777; font-size:15px;">
          Un email de confirmation vous sera envoyé avec toutes les informations utiles. <br/>
          Nous avons hâte de vous accueillir.
        </p>
        <div style="text-align:center; margin-top:25px;">
          <a href="https://moom.be" style="background-color:#d6ad60; color:white; text-decoration:none; padding:12px 24px; border-radius:8px; display:inline-block; font-weight:bold;">Visiter notre site</a>
        </div>
      </div>
      <div style="background:#fff7ef; padding:15px; text-align:center; font-size:13px; color:#888;">
        © ${new Date().getFullYear()} Moom Restaurant — Tous droits réservés
      </div>
    </div>
  </div>`;

  const restoHtml = `
  <div style="font-family: 'Lato', sans-serif; background-color: #f9f9f9; padding: 40px;">
    <div style="max-width: 600px; margin: auto; background: white; border-radius: 14px; box-shadow: 0 4px 25px rgba(0,0,0,0.05); overflow: hidden;">
      <div style="background-color: #fff7ef; padding: 20px 30px; border-bottom: 1px solid #f0e0d0;">
        <h2 style="color:#333; text-align:center;">Nouvelle réservation reçue</h2>
      </div>
      <div style="padding: 35px;">
        <p><strong>Nom :</strong> ${name}</p>
        <p><strong>Email :</strong> ${email}</p>
        <p><strong>Date :</strong> ${date}</p>
        <p><strong>Heure :</strong> ${heure}</p>
        <p><strong>Personnes :</strong> ${personnes}</p>
        <p><strong>Service :</strong> ${service}</p>
      </div>
      <div style="background:#fff7ef; padding:15px; text-align:center; font-size:13px; color:#888;">
        ⚡ Notification automatique du site Moom.be
      </div>
    </div>
  </div>`;

  await resend.emails.send({
    from: "Moom <noreply@moom.be>",
    to: [email],
    subject: "✅ Confirmation de votre réservation - Moom",
    html: clientHtml,
  });

  await resend.emails.send({
    from: "Moom <noreply@moom.be>",
    to: [restaurantEmail],
    subject: "📩 Nouvelle réservation reçue",
    html: restoHtml,
  });

  console.log("📧 Emails envoyés avec succès !");
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

