import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
    res.json({
        SUPABASE_URL: process.env.SUPABASE_URL || "❌ manquante",
        SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY ?
            "✅ définie" :
            "❌ manquante",
        SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ?
            "✅ définie" :
            "❌ manquante",
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?
            "✅ définie" :
            "❌ manquante",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?
            "✅ définie" :
            "❌ manquante",
    });
});

export default router;