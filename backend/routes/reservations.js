import express from "express";
import supabase from "../db.js";
import { v4 as uuidv4 } from "uuid";
import QRCode from "qrcode";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const router = express.Router();

const sendConfirmationEmails = async ({ email, name, date, heure, personnes, service, comment }) => {
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
        ${
          comment
            ? `<p>💬 Votre remarque : <em>${comment}</em></p>`
            : ""
        }
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
        ${
          comment
            ? `<p><strong>Remarque client :</strong> ${comment}</p>`
            : ""
        }
      `,
    });

    console.log("📧 Emails envoyés avec succès !");
  } catch (err) {
    console.error("❌ Erreur lors de l’envoi d’e-mails :", err);
  }
};


router.post("/", async (req, res) => {
  try {
    const {
      prenom,
      nom,
      societe,
      tva,
      email,
      tel,
      comment,
      date,
      heure,
      personnes,
      service,
      type,
    } = req.body;

    // 🧠 Nom d'affichage intelligent
    const name =
      type === "societe"
        ? `${societe || "Société"} (${prenom || ""} ${nom || ""})`.trim()
        : `${prenom || ""} ${nom || ""}`.trim();

    // 🧩 Identifiant + QR
    const id = uuidv4();
    const qrData = `Réservation #${id} - ${name} - ${date} - ${heure}`;
    const qrCodeBase64 = await QRCode.toDataURL(qrData);

    // 💾 Enregistrement en base
    const { error } = await supabase.from("reservations").insert([
      {
        id,
        name,
        email,
        tel,
        societe,
        tva,
        date,
        heure,
        personnes,
        service,
        comment,
        type,
        qrcode: qrCodeBase64,
      },
    ]);

    if (error) throw error;

    // ✉️ Envoi mail
    await sendConfirmationEmails({
      email,
      name,
      date,
      heure,
      personnes,
      service,
      comment,
    });

    res.status(201).json({ success: true, qrCode: qrCodeBase64 });
  } catch (err) {
    console.error("❌ Erreur POST /api/reservations :", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Export du routeur pour Express
export default router;


