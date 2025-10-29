import express from "express";
import { supabase } from "../db.js";
import { v4 as uuidv4 } from "uuid";
import QRCode from "qrcode";
import { Resend } from "resend";
import { format } from "date-fns";

const router = express.Router();
const resend = new Resend(process.env.RESEND_API_KEY);


/**
 * Vérifie le format TVA belge
 * Doit commencer par "BE" et contenir 10 chiffres
 */
function isValidBelgianVAT(tva) {
    if (!tva) return true; // facultatif, donc on accepte vide
    const clean = tva.replace(/\s|\.|-/g, "").toUpperCase();
    return /^BE\d{10}$/.test(clean);
}

/**
 * Fonction d'envoi des emails
 */
async function sendConfirmationEmails({
    email,
    name,
    date,
    heure_id,
    personnes,
    service,
    comment,
    tel,
    societe,
    tva,
}) {
    console.log("📨 Envoi d’email en cours pour :", email);

    // Formatage européen de la date
    let formattedDate = date;
    try {
        formattedDate = format(new Date(date), "dd-MM-yyyy");
    } catch (err) {
        console.warn("Erreur formatage date:", err.message);
    }

    // --- Mail client ---
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
            <tr><td><strong>Date</strong></td><td>${formattedDate}</td></tr>
            <tr><td><strong>Heure</strong></td><td>${heure_id}</td></tr>
            <tr><td><strong>Personnes</strong></td><td>${personnes}</td></tr>
            <tr><td><strong>Service</strong></td><td>${service}</td></tr>
          </table>
          ${societe ? `<p><strong>Société :</strong> ${societe}</p>` : ""}
          ${tva ? `<p><strong>TVA :</strong> ${tva}</p>` : ""}
          ${comment ? `<p><em>Remarque :</em> ${comment}</p>` : ""}
          <div style="text-align:center;margin-top:30px;">
            <a href="https://app.moom.be"
              style="display:inline-block;background:#000000;color:#ffffff;padding:12px 24px;border-radius:24px;text-decoration:none;">
              Voir ma réservation
            </a>
          </div>
          <p style="margin-top:40px;">À très bientôt,</p>
          <p style="font-weight:bold;">L’équipe du restaurant Moom</p>
        </div>
        <div style="background:#b3cdb0;text-align:center;padding:15px;border-radius:12px;font-size:11px;color:#000000;">
          Restaurant Moom • Ossel  |  <a href="mailto:info@moom.be" style="color:#555;">info@moom.be</a>
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
      ${societe ? `<p><strong>Société :</strong> ${societe}</p>` : ""}
      ${tva ? `<p><strong>TVA :</strong> ${tva}</p>` : ""}
      <p><strong>Date :</strong> ${formattedDate}</p>
      <p><strong>Heure :</strong> ${heure_id}</p>
      <p><strong>Personnes :</strong> ${personnes}</p>
      <p><strong>Service :</strong> ${service}</p>
      ${comment ? `<p><strong>Remarque :</strong> ${comment}</p>` : ""}
      <hr style="margin:20px 0;">
      <p style="color:#777;">Consultez le dashboard Supabase pour plus de détails.</p>
    </div>
  `;

  try {
    console.log("📤 Envoi mail client...");
    await resend.emails.send({
      from: "Restaurant Moom <no-reply@moom.be>",
      to: [email],
      subject: "✅ Confirmation de votre réservation - Moom",
      html: htmlClient,
    });

    console.log("📤 Envoi mail restaurant...");
    await resend.emails.send({
      from: "Restaurant Moom <no-reply@moom.be>",
      to: ["business@moom.be"],
      subject: `📥 Nouvelle réservation - ${name}`,
      html: htmlRestaurant,
    });

    console.log("✅ Mails envoyés avec succès !");
  } catch (err) {
    console.error("📩 Erreur lors de l’envoi d’e-mails :", err);
    throw new Error("Échec d’envoi d’e-mails via Resend");
  }
}

/**
 *  ROUTE POST — Création de réservation (version sécurisée)
 */
router.post("/", async (req, res) => {
  try {
    console.log("📬 Nouvelle requête reçue sur /api/reservations !");
    console.log("🧠 Corps reçu :", req.body);

    const {
      prenom,
      nom,
      email,
      date,
      heure_id,
      personnes,
      service,
      comment,
      remarque,
      tel,
      societe,
      tva,
    } = req.body;

    // Normalisation des champs
    const normalizedComment =
      (comment && comment.trim()) || (remarque && remarque.trim()) || "";
    const normalizedService =
      service && service.toLowerCase() === "diner" ? "dinner" : service;
    const name = `${prenom || ""} ${nom || ""}`.trim();

    // 🧾 Vérification TVA (facultative)
    if (tva && !isValidBelgianVAT(tva)) {
      console.warn("⚠️ TVA invalide :", tva);
      return res
        .status(400)
        .json({ success: false, message: "Numéro de TVA invalide (ex: BE0123456789)" });
    }

    // 🕒 Vérification champs requis
    if (!email || !date || !heure_id) {
      console.warn("⚠️ Champs manquants :", { email, date, heure_id });
      return res
        .status(400)
        .json({ success: false, message: "Champs requis manquants" });
    }

    // 🧩 Génération QR Code
    const formattedDate = format(new Date(date), "dd-MM-yyyy");
    const id = uuidv4();
    const qrData = `Réservation #${id} - ${name} - ${formattedDate}`;
    const qrCodeBase64 = await QRCode.toDataURL(qrData);

    console.log("🧾 Tentative insertion Supabase…");

    // ✅ Insertion dans la table "reservations"
    const { error: insertError } = await supabase.from("reservations").insert([
      {
        id,
        name,
        email,
        date,
        heure_id,
        personnes,
        service: normalizedService,
        comment: normalizedComment,
        tel,
        societe,
        tva,
        qrcode: qrCodeBase64,
      },
    ]);

    if (insertError) {
      console.error("❌ Erreur insertion Supabase :", insertError.message);
      return res.status(500).json({
        success: false,
        error: insertError.message,
      });
    }

    // ✅ Récupération de l’heure associée
    let heure = "—";
    try {
      const { data: heureData, error: heureError } = await supabase
        .from("heure")
        .select("horaire")
        .eq("id", heure_id)
        .maybeSingle();

      if (heureError) console.warn("⚠️ Erreur récupération heure :", heureError.message);
      heure = heureData?.horaire || "—";
    } catch (err) {
      console.warn("⚠️ Impossible de récupérer l’heure :", err.message);
    }

    // ✉️ Envoi d’email (sécurisé, non bloquant)
    try {
      console.log("🚀 Envoi d’email à", email);
      await sendConfirmationEmails({
        email,
        name,
        date,
        heure,
        personnes,
        service: normalizedService,
        tel,
        societe,
        tva,
      });
    } catch (mailError) {
      console.warn("⚠️ Erreur d’envoi email :", mailError.message);
    }

    res.status(201).json({
      success: true,
      message: "Réservation enregistrée avec succès ✅",
      qrCode: qrCodeBase64,
    });
  } catch (err) {
    console.error("💥 Erreur interne /api/reservations :", err);
    res.status(500).json({
      success: false,
      error: err.message || "Erreur serveur inconnue",
    });
  }
});

/**
 * 🧾 ROUTE GET — Liste des réservations
 */
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase.from("reservations").select("*");
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error("❌ Erreur GET /api/reservations :", err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;