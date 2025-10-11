import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Variables Supabase manquantes dans db.js !");
  throw new Error("❌ Variables Supabase manquantes !");
}

console.log("🔍 [db.js] SUPABASE_URL =", supabaseUrl);
console.log(
  "🔍 [db.js] SUPABASE_KEY =",
  supabaseKey ? "✅ Présente" : "❌ Manquante"
);

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
