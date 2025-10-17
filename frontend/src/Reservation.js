import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient"; // ⚠️ Doit exister
import { format } from "date-fns";

function Reservation() {
  const [supabaseStatus, setSupabaseStatus] = useState("pending");
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    async function testSupabase() {
      console.log("🚀 Test connexion Supabase...");
      try {
        const { data, error } = await supabase.from("reservations").select("*").limit(3);
        if (error) {
          console.error("❌ Erreur Supabase :", error.message);
          setSupabaseStatus("error");
        } else {
          console.log("✅ Connexion Supabase OK :", data);
          setSupabaseStatus("success");
          setReservations(data);
        }
      } catch (err) {
        console.error("⚠️ Erreur inattendue :", err);
        setSupabaseStatus("error");
      }
    }
    testSupabase();
  }, []);

  return (
    <div
      style={{
        fontFamily: "system-ui, sans-serif",
        backgroundColor: "#f8f9fa",
        minHeight: "100vh",
        padding: "2rem",
      }}
    >
      <h1 style={{ textAlign: "center", color: "#007bff" }}>
        🔍 Test de connexion à Supabase
      </h1>

      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        {supabaseStatus === "pending" && (
          <p style={{ color: "#6c757d" }}>⏳ Vérification de la connexion...</p>
        )}
        {supabaseStatus === "success" && (
          <p style={{ color: "#28a745" }}>✅ Connexion Supabase OK</p>
        )}
        {supabaseStatus === "error" && (
          <p style={{ color: "#dc3545" }}>❌ Erreur de connexion à Supabase</p>
        )}
      </div>

      {reservations.length > 0 && (
        <div
          style={{
            marginTop: "2rem",
            background: "#fff",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            padding: "1rem 2rem",
            maxWidth: "600px",
            margin: "2rem auto",
          }}
        >
          <h2 style={{ textAlign: "center", color: "#333" }}>
            📋 Réservations (exemple)
          </h2>
          <ul>
            {reservations.map((r, i) => (
              <li key={i} style={{ margin: "0.5rem 0" }}>
                <strong>{r.nom || "Anonyme"}</strong> –{" "}
                {format(new Date(r.date), "dd/MM/yyyy")} à {r.heure}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Reservation;



