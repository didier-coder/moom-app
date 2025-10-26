import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

console.log("✅ Supabase client initialisé :", supabaseUrl);

(async() => {
    const { data, error } = await supabase.from("restaurants").select("*").limit(1);
    if (error) console.error("❌ Erreur de connexion Supabase :", error.message);
    else console.log("✅ Connexion Supabase OK, exemple data :", data);
})();