import { createClient } from "@supabase/supabase-js";

// Vérification
console.log("🔍 SUPABASE_URL =", process.env.SUPABASE_URL);
console.log("🔍 SUPABASE_KEY =", process.env.SUPABASE_ANON_KEY ? "✅ Présente" : "❌ Manquante");

// Vérifie la présence des variables
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  throw new Error("❌ Variables Supabase manquantes !");
}

// Crée le client Supabase unique pour tout le backend
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);
