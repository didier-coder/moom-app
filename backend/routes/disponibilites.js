import express from "express";
import { supabase } from "../db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { restaurant_id, date } = req.query;

    if (!restaurant_id || !date) {
      return res.status(400).json({ error: "restaurant_id et date sont requis" });
    }

    const jourSemaine = new Date(date)
      .toLocaleDateString("fr-FR", { weekday: "long" })
      .toLowerCase();

    console.log(`🔎 Recherche disponibilités pour restaurant ${restaurant_id}, jour ${jourSemaine}`);

    // 🔹 Récupère les horaires du jour
    const { data: horaires, error: errHoraires } = await supabase
      .from("horaires")
      .select("*")
      .eq("restaurant_id", restaurant_id)
      .eq("jour", jourSemaine)
      .maybeSingle();

    // 🔹 Applique des horaires par défaut si vide
    let heuresOuverture = [];
    if (
      errHoraires ||
      !horaires ||
      (!horaires.ouverture1 &&
        !horaires.fermeture1 &&
        !horaires.ouverture2 &&
        !horaires.fermeture2)
    ) {
      console.log(`ℹ️ Aucune donnée horaire → application des horaires par défaut.`);
      heuresOuverture = [
        { ouverture: "12:00", fermeture: "15:00" },
        { ouverture: "18:00", fermeture: "22:00" },
      ];
    } else {
      heuresOuverture = [
        { ouverture: horaires.ouverture1, fermeture: horaires.fermeture1 },
        { ouverture: horaires.ouverture2, fermeture: horaires.fermeture2 },
      ];
    }

    // 🔹 Vérifie les jours de fermeture planifiés
    const { data: fermetures } = await supabase
      .from("fermetures")
      .select("*")
      .eq("restaurant_id", restaurant_id);

    const estFerme = fermetures?.some((f) => f.date === date) || jourSemaine === "dimanche";

    if (estFerme) {
      console.log(`🚫 Fermeture automatique ou planifiée pour ${jourSemaine}`);
      return res.status(200).json({
        restaurant_id,
        date,
        horaires: [],
        message: "Restaurant fermé ce jour-là",
      });
    }

    // 🔹 Liste complète des heures
    const { data: heures } = await supabase
      .from("heure")
      .select("horaire")
      .order("horaire", { ascending: true });

    let dispos = [];

    for (const h of heures) {
      const t = h.horaire;
      if (
        (heuresOuverture[0].ouverture &&
          heuresOuverture[0].fermeture &&
          t >= heuresOuverture[0].ouverture &&
          t <= heuresOuverture[0].fermeture) ||
        (heuresOuverture[1].ouverture &&
          heuresOuverture[1].fermeture &&
          t >= heuresOuverture[1].ouverture &&
          t <= heuresOuverture[1].fermeture)
      ) {
        dispos.push(t);
      }
    }

    // 🔹 Retire les heures déjà réservées
    const { data: reservations } = await supabase
      .from("reservations")
      .select("heure_id")
      .eq("restaurant_id", restaurant_id)
      .eq("date", date);

    if (reservations?.length > 0) {
      const { data: heuresReservees } = await supabase
        .from("heure")
        .select("id, horaire")
        .in(
          "id",
          reservations.map((r) => r.heure_id)
        );

      const horairesReserves = heuresReservees?.map((h) => h.horaire) || [];
      dispos = dispos.filter((h) => !horairesReserves.includes(h));
    }

    console.log(`✅ ${dispos.length} créneaux disponibles pour ${jourSemaine}`);

    res.status(200).json({
      restaurant_id,
      date,
      horaires: dispos,
    });
  } catch (error) {
    console.error("💥 Erreur /api/disponibilites :", error);
    res.status(500).json({ error: "Erreur serveur", details: error.message });
  }
});

export default router;
