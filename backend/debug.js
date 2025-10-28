export default function handler(req, res) {
    return res.status(200).json({
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
}