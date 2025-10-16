// frontend/src/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

// ⚙️ Ces variables seront injectées par Vercel (ou ton .env.local en local)
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

// 🧩 Création du client Supabase
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
