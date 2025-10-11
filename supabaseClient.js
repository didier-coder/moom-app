import { createClient } from "@supabase/supabase-js";

// Vérification et log au démarrage
console.log("🔍 SUPABASE_URL =", process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log("🔍 SUPABASE_KEY =", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Présente" : "❌ Manquante");

// Vérifie que les variables existent
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error("❌ Variables Supabase manquantes !");
}

// Crée le client une fois pour tout le backend
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
