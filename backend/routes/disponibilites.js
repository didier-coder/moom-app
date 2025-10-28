import express from "express";
import { supabase } from "../db.js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

/**
 * GET /api/disponibilites?restaurant_id=1&date=2025-10-12
 */
router.get("/", async(req, res) => {
    try {
        const { restaurant_id, date } = req.query;

        if (!restaurant_id || !date) {
            return res
                .status(400)
                .json({ error: "restaurant_id et date sont requis" });
        }

        const jourSemaine = new Date(date)
            .toLocaleDateString("fr-FR", { weekday: "long" })
            .toLowerCase();

        console.log(`🔎 Recherche disponibilités pour restaurant ${restaurant_id}, jour ${jourSemaine}`);

        // 1️⃣ Récupère les horaires du restaurant
        const { data: horaires, error: errHoraires } = await supabase
            .from("horaires")
            .select("*")
            .eq("restaurant_id", restaurant_id)
            .eq("jour", jourSemaine)
            .maybeSingle();

        // 2️⃣ Si aucun horaire ou tout NULL, appliquer un horaire par défaut
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

        // 3️⃣ Vérifie les jours de fermeture planifiés
        const { data: fermetures } = await supabase
            .from("fermetures")
            .select("*")
            .eq("restaurant_id", restaurant_id);

        const estFerme =
            fermetures ? .some(
                (f) =>
                (f.type === "recurrente" && f.jour === jourSemaine) ||
                (f.type === "exceptionnelle" && f.date === date)
            ) ? ? false;

        if (estFerme || jourSemaine === "dimanche") {
            console.log(`🚫 Fermeture automatique ou planifiée pour ${jourSemaine}`);
            return res.status(200).json({
                restaurant_id,
                date,
                horaires: [],
                message: "Restaurant fermé ce jour-là",
            });
        }

        // 4️⃣ Récupère la liste complète des heures disponibles
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

        // 5️⃣ Retire les créneaux déjà réservés
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

            const horairesReserves = heuresReservees ? .map((h) => h.horaire);
            dispos = dispos.filter((h) => !horairesReserves ? .includes(h));
        }

        // ✅ Réponse finale
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