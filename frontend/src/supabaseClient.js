import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://gssxvuhzvoxbatbqanaz.supabase.co"; // ton URL Supabase
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdzc3h2dWh6dm94YmF0YnFhbmF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwNTQzMzAsImV4cCI6MjA3NTYzMDMzMH0.CnpRx5cZyRcKGCLvx-8tOtAXwx9nEc2NJLzK2yNAg9E"; // ta clé publique (ANON KEY)

export const supabase = createClient(supabaseUrl, supabaseKey);

