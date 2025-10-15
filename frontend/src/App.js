import { useState } from "react";
import FermeturesAdmin from "./FermeturesAdmin";
import Reservation from "./Reservation";

function App() {
  const [view, setView] = useState("reservation");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");

  // 🔐 Mot de passe admin — à personnaliser
  const ADMIN_PASSWORD = "moom2025";

  const handleLogin = () => {
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setPasswordInput("");
    } else {
      alert("❌ Mot de passe incorrect");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setView("reservation");
  };

  return (
    <div style={{ fontFamily: "sans-serif" }}>
      {/* Barre de navigation */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
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

        {/* Bouton de déconnexion (visible uniquement en mode admin connecté) */}
        {isAuthenticated && view === "admin" && (
          <button
            onClick={handleLogout}
            style={{
              background: "#dc3545",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              padding: "0.6rem 1rem",
              cursor: "pointer",
            }}
          >
            🚪 Déconnexion
          </button>
        )}
      </div>

      {/* Contenu dynamique */}
      <div style={{ marginTop: "2rem" }}>
        {view === "reservation" ? (
          <Reservation />
        ) : isAuthenticated ? (
          <FermeturesAdmin />
        ) : (
          <div style={{ textAlign: "center", marginTop: "3rem" }}>
            <h2>🔒 Accès réservé à l’administration</h2>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Entrez le mot de passe"
              style={{
                padding: "0.6rem",
                borderRadius: "8px",
                border: "1px solid #ccc",
                marginTop: "1rem",
                width: "220px",
              }}
            />
            <br />
            <button
              onClick={handleLogin}
              style={{
                backgroundColor: "#28a745",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                padding: "0.6rem 1.2rem",
                cursor: "pointer",
                marginTop: "1rem",
              }}
            >
              Se connecter
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
