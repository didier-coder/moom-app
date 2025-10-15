import { useState } from "react";
import FermeturesAdmin from "./FermeturesAdmin";
import Reservation from "./Reservation";

function App() {
  const [view, setView] = useState("reservation"); // "reservation" ou "admin"

  return (
    <div style={{ fontFamily: "sans-serif" }}>
      {/* Barre de navigation */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "1rem",
          background: "#f8f9fa",
          padding: "1rem",
          borderBottom: "1px solid #dee2e6",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <button
          onClick={() => setView("reservation")}
          style={{
            background: view === "reservation" ? "#007bff" : "#e9ecef",
            color: view === "reservation" ? "#fff" : "#333",
            border: "none",
            borderRadius: "6px",
            padding: "0.6rem 1rem",
            cursor: "pointer",
          }}
        >
          🪑 Réservations
        </button>

        <button
          onClick={() => setView("admin")}
          style={{
            background: view === "admin" ? "#28a745" : "#e9ecef",
            color: view === "admin" ? "#fff" : "#333",
            border: "none",
            borderRadius: "6px",
            padding: "0.6rem 1rem",
            cursor: "pointer",
          }}
        >
          ⚙️ Admin Fermetures
        </button>
      </div>

      {/* Contenu dynamique */}
      <div style={{ marginTop: "2rem" }}>
        {view === "reservation" ? <Reservation /> : <FermeturesAdmin />}
      </div>
    </div>
  );
}

export default App;
