import express from "express";
import { supabase } from "../db.js";

const router = express.Router();

/**
 * 🧭 GET /api/fermetures
 * Récupère toutes les fermetures (hebdomadaires + exceptionnelles)
 */
router.get("/", async(req, res) => {
    try {
        const { data, error } = await supabase
            .from("fermetures")
            .select("*")
            .order("date_exceptionnelle", { ascending: true });

        if (error) throw error;

        res.status(200).json({ success: true, data });
    } catch (err) {
        console.error("❌ Erreur GET /fermetures :", err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});

/**
 * ➕ POST /api/fermetures
 * Ajoute une fermeture (hebdomadaire ou exceptionnelle)
 */
router.post("/", async(req, res) => {
    try {
        const { type, jour_semaine, date_exceptionnelle, raison, actif, restaurant_id } = req.body;

        const { data, error } = await supabase
            .from("fermetures")
            .insert([{ type, jour_semaine, date_exceptionnelle, raison, actif, restaurant_id }])
            .select();

        if (error) throw error;

        res.status(201).json({ success: true, data });
    } catch (err) {
        console.error("❌ Erreur POST /fermetures :", err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});

/**
 * ✏️ PUT /api/fermetures/:id
 * Met à jour une fermeture existante
 */
router.put("/:id", async(req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const { data, error } = await supabase
            .from("fermetures")
            .update(updates)
            .eq("id", id)
            .select();

        if (error) throw error;

        res.status(200).json({ success: true, data });
    } catch (err) {
        console.error("❌ Erreur PUT /fermetures :", err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});

/**
 * ❌ DELETE /api/fermetures/:id
 * Supprime une fermeture
 */
router.delete("/:id", async(req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabase.from("fermetures").delete().eq("id", id);

        if (error) throw error;

        res.status(200).json({ success: true, message: "Fermeture supprimée avec succès" });
    } catch (err) {
        console.error("❌ Erreur DELETE /fermetures :", err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});

export default router;