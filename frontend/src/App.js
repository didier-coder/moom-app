import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import FermeturesAdmin from "./FermeturesAdmin";
import Reservation from "./Reservation";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");

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
  };

  return (
    <Router>
      <div
        style={{
          fontFamily: "system-ui, sans-serif",
          position: "relative",
          backgroundColor: "#f8f9fa",
          minHeight: "100vh",
        }}
      >
        {/* ✅ Barre de navigation */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
            gap: "0.8rem",
            background: "#fff",
            padding: "1rem",
            borderBottom: "1px solid #dee2e6",
            position: "sticky",
            top: 0,
            zIndex: 10,
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
          }}
        >
          <Link
            to="/"
            style={{
              background: window.location.pathname === "/" ? "#007bff" : "#e9ecef",
              color: window.location.pathname === "/" ? "#fff" : "#333",
              border: "none",
              borderRadius: "8px",
              padding: "0.8rem 1.4rem",
              fontSize: "1rem",
              fontWeight: "500",
              cursor: "pointer",
              textDecoration: "none",
              flex: "1 1 140px",
              textAlign: "center",
              transition: "0.2s",
            }}
          >
            🪑 Réservations
          </Link>

          <Link
            to="/admin"
            style={{
              background: window.location.pathname.startsWith("/admin")
                ? "#28a745"
                : "#e9ecef",
              color: window.location.pathname.startsWith("/admin") ? "#fff" : "#333",
              border: "none",
              borderRadius: "8px",
              padding: "0.8rem 1.4rem",
              fontSize: "1rem",
              fontWeight: "500",
              cursor: "pointer",
              textDecoration: "none",
              flex: "1 1 160px",
              textAlign: "center",
              transition: "0.2s",
            }}
          >
            ⚙️ Admin Fermetures
          </Link>

          {isAuthenticated && window.location.pathname.startsWith("/admin") && (
            <button
              onClick={handleLogout}
              style={{
                background: "#dc3545",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                padding: "0.8rem 1.4rem",
                fontSize: "1rem",
                fontWeight: "500",
                cursor: "pointer",
                flex: "1 1 150px",
                transition: "0.2s",
              }}
            >
              🚪 Déconnexion
            </button>
          )}
        </div>

        {/* ✅ Badge “Admin connecté” */}
        {isAuthenticated && window.location.pathname.startsWith("/admin") && (
          <div
            style={{
              position: "fixed",
              top: "12px",
              right: "15px",
              background: "#198754",
              color: "white",
              padding: "0.5rem 0.8rem",
              borderRadius: "8px",
              fontSize: "0.9rem",
              fontWeight: "500",
              boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
              zIndex: 20,
            }}
          >
            ✅ Admin connecté
          </div>
        )}

        {/* ✅ Contenu animé */}
        <div style={{ marginTop: "2rem", padding: "1rem" }}>
          <AnimatePresence mode="wait">
            <Routes>
              <Route
                path="/"
                element={
                  <motion.div
                    key="reservation"
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  >
                    <Reservation />
                  </motion.div>
                }
              />

              <Route
                path="/admin"
                element={
                  isAuthenticated ? (
                    <motion.div
                      key="admin"
                      initial={{ opacity: 0, x: 40 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -40 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                    >
                      <FermeturesAdmin />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="login"
                      initial={{ opacity: 0, x: 40 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -40 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                    >
                      <div
                        style={{
                          textAlign: "center",
                          marginTop: "3rem",
                          background: "#fff",
                          maxWidth: "400px",
                          margin: "3rem auto",
                          padding: "2rem",
                          borderRadius: "12px",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                        }}
                      >
                        <h2>🔒 Accès réservé à l’administration</h2>
                        <input
                          type="password"
                          value={passwordInput}
                          onChange={(e) => setPasswordInput(e.target.value)}
                          placeholder="Entrez le mot de passe"
                          style={{
                            padding: "0.8rem",
                            borderRadius: "8px",
                            border: "1px solid #ccc",
                            marginTop: "1rem",
                            width: "100%",
                            fontSize: "1rem",
                          }}
                        />
                        <button
                          onClick={handleLogin}
                          style={{
                            backgroundColor: "#28a745",
                            color: "#fff",
                            border: "none",
                            borderRadius: "8px",
                            padding: "0.8rem 1.4rem",
                            cursor: "pointer",
                            marginTop: "1rem",
                            fontWeight: "500",
                            width: "100%",
                            fontSize: "1rem",
                          }}
                        >
                          Se connecter
                        </button>
                      </div>
                    </motion.div>
                  )
                }
              />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AnimatePresence>
        </div>
      </div>
    </Router>
  );
}

export default App;
