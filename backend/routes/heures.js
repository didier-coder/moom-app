// backend/routes/heures.js
const express = require("express");
const router = express.Router();
const { supabase } = require("../supabaseClient");

// 🔹 Récupération de tous les horaires disponibles
router.get("/", async(req, res) => {
    const { data, error } = await supabase
        .from("heure")
        .select("id, horaire")
        .order("horaire", { ascending: true });

    if (error) {
        console.error("Erreur Supabase heures:", error);
        return res.status(500).json({ error: error.message });
    }

    res.json(data);
});

module.exports = router;