import { createClient } from "@supabase/supabase-js";

console.log("🔍 [db.js] SUPABASE_URL =", process.env.SUPABASE_URL);
console.log("🔍 [db.js] SUPABASE_KEY =", process.env.SUPABASE_ANON_KEY ? "✅ Présente" : "❌ Manquante");

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  throw new Error("❌ Variables Supabase manquantes dans db.js !");
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default supabase;

