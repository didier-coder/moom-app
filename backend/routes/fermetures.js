import express from "express";
import { supabase } from "../db.js";

const router = express.Router();

router.get("/", async(req, res) => {
    try {
        const { data, error } = await supabase
            .from("fermetures")
            .select("*")
            .order("date", { ascending: true });

        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error("❌ Erreur /api/fermetures :", err.message);
        res.status(500).json({ error: err.message });
    }
});

export default router;