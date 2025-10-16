import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FermeturesAdmin from "./FermeturesAdmin";

export default function Admin() {
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
    <div
      style={{
        fontFamily: "system-ui, sans-serif",
        backgroundColor: "#f8f9fa",
        minHeight: "100vh",
        padding: "2rem",
      }}
    >
      <AnimatePresence mode="wait">
        {isAuthenticated ? (
          <motion.div
            key="admin-panel"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.4 }}
          >
            <div style={{ textAlign: "right", marginBottom: "1rem" }}>
              <button
                onClick={handleLogout}
                style={{
                  background: "#dc3545",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "0.6rem 1.2rem",
                  fontSize: "1rem",
                  cursor: "pointer",
                }}
              >
                🚪 Déconnexion
              </button>
            </div>
            <FermeturesAdmin />
          </motion.div>
        ) : (
          <motion.div
            key="login-form"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.4 }}
          >
            <div
              style={{
                textAlign: "center",
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
        )}
      </AnimatePresence>
    </div>
  );
}
