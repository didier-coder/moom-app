import express from "express";
import supabase from "../db.js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

/**
 * GET /api/disponibilites?restaurant_id=1&date=2025-10-12
 */
router.get("/", async (req, res) => {
  try {
    const { restaurant_id, date } = req.query;

    if (!restaurant_id || !date) {
      return res
        .status(400)
        .json({ error: "restaurant_id et date sont requis" });
    }

    // 🧭 Récupère le jour de la semaine (ex: "lundi")
    const jourSemaine = new Date(date)
      .toLocaleDateString("fr-FR", { weekday: "long" })
      .toLowerCase();

    console.log(`🔎 Recherche des horaires pour restaurant ${restaurant_id}, jour ${jourSemaine}`);

    // 🏪 1. Récupère les horaires du restaurant pour ce jour
    const { data: horaires, error: errHoraires } = await supabase
      .from("horaires")
      .select("*")
      .eq("restaurant_id", restaurant_id)
      .eq("jour", jourSemaine)
      .maybeSingle(); // ✅ évite l’erreur si aucune ligne trouvée

    // 🛑 2. Si aucun horaire ou tout est NULL → restaurant fermé
    if (
      errHoraires ||
      !horaires ||
      (!horaires.ouverture1 &&
        !horaires.fermeture1 &&
        !horaires.ouverture2 &&
        !horaires.fermeture2)
    ) {
      console.log(`🚫 Restaurant ${restaurant_id} fermé le ${jourSemaine}`);
      return res.status(200).json({
        restaurant_id,
        date,
        horaires: [],
        message: "Restaurant fermé ce jour-là",
      });
    }

    // 🕒 3. Récupère tous les créneaux horaires (12h → 22h)
    const { data: heures, error: errHeures } = await supabase
      .from("heure")
      .select("horaire")
      .order("horaire", { ascending: true });

    if (errHeures || !heures) {
      console.error("⚠️ Erreur récupération heures :", errHeures);
      return res.status(500).json({ error: "Erreur récupération des heures" });
    }

    let dispos = [];

    // 🧮 4. Filtre les créneaux selon les horaires du jour
    for (const h of heures) {
      const t = h.horaire;
      if (
        (horaires.ouverture1 && horaires.fermeture1 && t >= horaires.ouverture1 && t <= horaires.fermeture1) ||
        (horaires.ouverture2 && horaires.fermeture2 && t >= horaires.ouverture2 && t <= horaires.fermeture2)
      ) {
        dispos.push(t);
      }
    }

    // 🛑 5. Vérifie si c’est un jour de fermeture (recurrente ou exceptionnelle)
    const { data: fermetures } = await supabase
      .from("fermetures")
      .select("*")
      .eq("restaurant_id", restaurant_id);

    const estFerme =
      fermetures?.some(
        (f) =>
          (f.type === "recurrente" && f.jour === jourSemaine) ||
          (f.type === "exceptionnelle" && f.date === date)
      ) ?? false;

    if (estFerme) {
      console.log(`🚫 Fermeture planifiée pour ${jourSemaine}`);
      return res.status(200).json({
        restaurant_id,
        date,
        horaires: [],
        message: "Restaurant fermé ce jour-là",
      });
    }

    // 🧾 6. Retire les créneaux déjà réservés
    const { data: reservations } = await supabase
      .from("reservations")
      .select("heure_id")
      .eq("restaurant_id", restaurant_id)
      .eq("date", date);

    if (reservations && reservations.length > 0) {
      const { data: heuresReservees } = await supabase
        .from("heure")
        .select("id, horaire")
        .in(
          "id",
          reservations.map((r) => r.heure_id)
        );

      const horairesReserves = heuresReservees?.map((h) => h.horaire);
      dispos = dispos.filter((h) => !horairesReserves?.includes(h));
    }

    // ✅ 7. Réponse finale
    console.log(`✅ ${dispos.length} créneaux disponibles pour ${jourSemaine}`);

    return res.status(200).json({
      restaurant_id,
      date,
      horaires: dispos,
    });
  } catch (error) {
    console.error("💥 Erreur serveur :", error);
    res.status(500).json({ error: "Erreur serveur", details: error.message });
  }
});

export default router;

