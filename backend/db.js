import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("❌ Variables Supabase manquantes !");
    throw new Error("❌ Variables Supabase manquantes !");
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey);