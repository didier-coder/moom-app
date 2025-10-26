import React, { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";

const Restaurants = () => {
  const [restaurants, setRestaurants] = useState([]);

  useEffect(() => {
    const testSupabase = async () => {
      const { data, error } = await supabase.from("restaurants").select("*");
      if (error) console.error("❌ Erreur connexion Supabase :", error.message);
      else console.log("✅ Connexion Supabase réussie :", data);
    };
    testSupabase();
  }, []);

  return (
    <div style={styles.container}>
      <h1>Gestion des restaurants</h1>
      {restaurants.length === 0 ? (
        <p>Aucun restaurant trouvé.</p>
      ) : (
        <ul style={styles.list}>
          {restaurants.map((r) => (
            <li key={r.id} style={styles.item}>
              <strong>{r.nom}</strong> — {r.adresse || "Adresse inconnue"}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const styles = {
  container: { padding: "1rem" },
  list: { listStyle: "none", padding: 0 },
  item: {
    background: "#fff",
    borderRadius: "8px",
    padding: "0.8rem 1rem",
    marginBottom: "0.6rem",
    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
  },
};

export default Restaurants;
