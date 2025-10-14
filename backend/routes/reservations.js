import express from "express";
import supabase from "../db.js";
import { v4 as uuidv4 } from "uuid";
import QRCode from "qrcode";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const router = express.Router();

/**
 * 💌 Fonction d'envoi des emails
 */
async function sendConfirmationEmails({ email, name, date, heure, personnes, service, comment, tel }) {
  console.log("📧 Envoi des mails pro...");

  // --- Mail client (style ZenChef) ---
  const htmlClient = `
    <div style="font-family:'Helvetica Neue',Arial,sans-serif;background-color:#f9f9f9;padding:40px 0;color:#333;">
      <div style="max-width:600px;margin:0 auto;background:#b3cdb0;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.08);overflow:hidden;">
        <div style="background:#b3cdb0;color:#000000;text-align:center;padding:25px;">
          <img src="https://moom.be/assets/imgs/logo/logo-dark.png" alt="Restaurant Moom" style="width:100px;margin-bottom:10px;">
          <h2 style="margin:0;">Confirmation de réservation</h2>
        </div>
        <div style="padding:30px;">
          <p>Bonjour <strong>${name}</strong>,</p>
          <p>Nous avons le plaisir de confirmer votre réservation au restaurant <strong>Moom</strong>.</p>
          <table style="width:100%;margin:20px 0;border-collapse:collapse;">
            <tr><td><strong>Date</strong></td><td>${date}</td></tr>
            <tr><td><strong>Heure</strong></td><td>${heure}</td></tr>
            <tr><td><strong>Personnes</strong></td><td>${personnes}</td></tr>
            <tr><td><strong>Service</strong></td><td>${service}</td></tr>
          </table>
          ${comment ? `<p><em>Remarque :</em> ${comment}</p>` : ""}
          <div style="text-align:center;margin-top:30px;">
            <a href="https://moom-app.onrender.com"
              style="display:inline-block;background:#000000;color:#ffffff;padding:12px 24px;border-radius:24px;text-decoration:none;">
              Voir ma réservation
            </a>
          </div>
          <p style="margin-top:40px;">À très bientôt,</p>
          <p style="font-weight:bold;">L’équipe du restaurant Moom</p>
        </div>
        <div style="background:#f0f0f0;text-align:center;padding:15px;font-size:13px;color:#888;">
          Restaurant Moom • Oostende<br/>
          <a href="mailto:info@moom.be" style="color:#555;">info@moom.be</a>
        </div>
      </div>
    </div>
  `;

  // --- Mail restaurateur ---
  const htmlRestaurant = `
    <div style="font-family:Arial,sans-serif;background:#fff;padding:25px;color:#333;">
      <h2 style="color:#002B5B;">Nouvelle réservation reçue 🍽️</h2>
      <p><strong>Nom :</strong> ${name}</p>
      <p><strong>Email :</strong> ${email}</p>
      <p><strong>Téléphone :</strong> ${tel || "—"}</p>
      <p><strong>Date :</strong> ${date}</p>
      <p><strong>Heure :</strong> ${heure}</p>
      <p><strong>Personnes :</strong> ${personnes}</p>
      <p><strong>Service :</strong> ${service}</p>
      ${comment ? `<p><strong>Remarque :</strong> ${comment}</p>` : ""}
      <hr style="margin:20px 0;">
      <p style="color:#777;">Consultez le dashboard Supabase pour plus de détails.</p>
    </div>
  `;

  // --- Envoi des emails ---
  await resend.emails.send({
    from: "Restaurant Moom <no-reply@moom.be>",
    to: [email],
    subject: "✅ Confirmation de votre réservation - Moom",
    html: htmlClient,
  });

  await resend.emails.send({
    from: "Restaurant Moom <no-reply@moom.be>",
    to: ["business@moom.be"],
    subject: `📥 Nouvelle réservation - ${name}`,
    html: htmlRestaurant,
  });

  console.log("✅ Mails envoyés avec succès !");
}

/**
 * 🧾 ROUTE POST — Création de réservation
 */
router.post("/", async (req, res) => {
  try {
    const { prenom, nom, email, date, heure, personnes, service, remarque, societe, tel, tva, particulier } = req.body;
    const name = `${prenom} ${nom}`.trim();
    const comment = remarque;
    const id = uuidv4();

    // Génération du QR code
    const qrData = `Réservation #${id} - ${name} - ${date} à ${heure}`;
    const qrCodeBase64 = await QRCode.toDataURL(qrData);

    // Insertion dans Supabase
    const { error } = await supabase
      .from("reservations")
      .insert([{ id, name, email, date, heure, personnes, service, comment, societe, tel, tva, particulier, qrcode: qrCodeBase64 }]);

    if (error) throw error;

    // Envoi des emails
    await sendConfirmationEmails({ email, name, date, heure, personnes, service, comment, tel });

    res.status(201).json({ success: true, qrCode: qrCodeBase64 });
  } catch (err) {
    console.error("❌ Erreur POST /api/reservations :", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * 🧾 ROUTE GET — Liste des réservations
 */
router.get("/", async (req, res) => {
  const { data, error } = await supabase.from("reservations").select("*");
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

export default router;





