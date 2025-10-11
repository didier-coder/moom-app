import express from "express";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

/**
 * GET /api/disponibilites?restaurant_id=1&date=2025-10-12
 */
router.get("/", async (req, res) => {
  try {
    const { restaurant_id, date } = req.query;

    if (!restaurant_id || !date) {
      return res.status(400).json({ error: "restaurant_id et date sont requis" });
    }

    // 🧭 Récupère le jour de la semaine (ex: "lundi")
    const jourSemaine = new Date(date)
      .toLocaleDateString("fr-FR", { weekday: "long" })
      .toLowerCase();

    // 🏪 1. Récupère les horaires du restaurant pour ce jour
    const { data: horaires, error: errHoraires } = await supabase
      .from("horaires")
      .select("*")
      .eq("restaurant_id", restaurant_id)
      .eq("jour", jourSemaine)
      .eq("actif", true)
      .single();

    if (errHoraires || !horaires)
      return res.status(404).json({ error: "Aucun horaire trouvé pour ce jour" });

    // 🛑 2. Vérifie si c’est un jour de fermeture
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

    if (estFerme)
      return res.status(200).json({
        restaurant_id,
        date,
        horaires: [],
        message: "Restaurant fermé ce jour-là",
      });

    // 🕒 3. Récupère tous les créneaux horaires (12h → 22h)
    const { data: heures } = await supabase
      .from("heure")
      .select("horaire")
      .order("horaire", { ascending: true });

    let dispos = [];

    // 🧮 4. Filtre les créneaux selon les horaires du jour
    for (const h of heures) {
      const t = h.horaire;
      if (
        (t >= horaires.ouverture1 && t <= horaires.fermeture1) ||
        (t >= horaires.ouverture2 && t <= horaires.fermeture2)
      ) {
        dispos.push(t);
      }
    }

    // 🧾 5. Retire les créneaux déjà réservés
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

    // ✅ 6. Réponse finale
    return res.status(200).json({
      restaurant_id,
      date,
      horaires: dispos,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur", details: error.message });
  }
});

export default router;
