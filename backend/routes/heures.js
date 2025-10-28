import express from "express";
import { supabase } from "../db.js"; // ✅ bien avec { ... }

const router = express.Router();

router.get("/", async(req, res) => {
    try {
        const { data, error } = await supabase
            .from("heure")
            .select("*")
            .order("horaire", { ascending: true });

        if (error) throw error;
        res.status(200).json(data);
    } catch (err) {
        console.error("❌ Erreur /api/heures :", err.message);
        res.status(500).json({ error: err.message });
    }
});

export default router;