import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";

export default function Restaurants() {
  const [restaurants, setRestaurants] = useState([]);

console.log("🌍 SUPABASE_URL =", process.env.REACT_APP_SUPABASE_URL);
console.log("🔑 SUPABASE_KEY =", process.env.REACT_APP_SUPABASE_ANON_KEY ? "✅ Clé détectée" : "❌ Clé manquante");


  // ✅ Test de connexion Supabase à l'intérieur du composant
  useEffect(() => {
    const testConnection = async () => {
      const { data, error } = await supabase.from("restaurants").select("id, nom").limit(1);
      if (error) {
        console.error("❌ Erreur de connexion Supabase:", error.message);
      } else {
        console.log("✅ Connexion Supabase réussie :", data);
      }
    };
    testConnection();
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h2>🍴 Restaurants</h2>
      <p>Test de connexion Supabase dans la console ✅</p>
    </div>
  );
}
