import React, { useState, useEffect } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format, isToday } from "date-fns";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaUserFriends, FaCalendarAlt, FaClock } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "./supabaseClient";
import "./App.css";

function Reservation() {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedHeure, setSelectedHeure] = useState("");
  const [personnes, setPersonnes] = useState(2);
  const [service, setService] = useState("lunch");
  const [typeClient, setTypeClient] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [heuresDispo, setHeuresDispo] = useState([]);
  const [formData, setFormData] = useState({
    societe: "",
    tva: "",
    prenom: "",
    nom: "",
    tel: "",
    email: "",
    remarque: "",
  });
  const [supabaseStatus, setSupabaseStatus] = useState("pending");

  // ✅ Test de connexion à Supabase
  useEffect(() => {
    async function testSupabase() {
      console.log("🚀 Test Supabase démarré");
      try {
        const { data, error } = await supabase.from("reservations").select("*").limit(1);
        if (error) {
          console.error("❌ Erreur Supabase :", error.message);
          setSupabaseStatus("error");
        } else {
          console.log("✅ Connexion Supabase OK :", data);
          setSupabaseStatus("success");
        }
      } catch (err) {
        console.error("⚠️ Erreur inattendue :", err);
        setSupabaseStatus("error");
      }
    }
    testSupabase();
  }, []);

  // ✅ Génération automatique des horaires
  function genererHeures(debut, fin, intervalleMinutes) {
    const heures = [];
    let [h, m] = debut.split(":").map(Number);
    const [hFin, mFin] = fin.split(":").map(Number);
    while (h < hFin || (h === hFin && m <= mFin)) {
      heures.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
      m += intervalleMinutes;
      if (m >= 60) {
        h++;
        m -= 60;
      }
    }
    return heures;
  }

  const heuresLunch = genererHeures("12:00", "14:30", 15);
  const heuresDiner = genererHeures("18:00", "22:00", 15);

  // 🕒 Met à jour les heures disponibles selon la date et le service
  useEffect(() => {
    const maintenant = new Date();
    const heures = service === "lunch" ? heuresLunch : heuresDiner;
    if (selectedDate && isToday(selectedDate)) {
      const heuresFiltrees = heures.filter((h) => {
        const [heure, minute] = h.split(":");
        const heureDate = new Date();
        heureDate.setHours(heure, minute);
        return heureDate > maintenant;
      });
      setHeuresDispo(heuresFiltrees);
    } else {
      setHeuresDispo(heures);
    }
  }, [selectedDate, service]);

  // ✅ Envoi de la réservation
  const handleReservation = async () => {
    if (selectedDate < new Date().setHours(0, 0, 0, 0)) {
      toast.error("Vous ne pouvez pas réserver pour une date passée.");
      return;
    }

    if (!selectedDate || !selectedHeure || !formData.prenom || !formData.nom || !formData.email) {
      toast.warning("Merci de compléter tous les champs obligatoires.");
      return;
    }

    setSubmitting(true);
    try {
      const formattedDate = format(selectedDate, "yyyy-MM-dd");
      const data = {
        restaurant_id: 1,
        personnes,
        date: formattedDate,
        heure: selectedHeure,
        service,
        type: typeClient,
        ...formData,
      };

      const url = `${process.env.REACT_APP_API_URL}/api/reservations`;
      const res = await axios.post(url, data);

      if (res?.data?.success) {
        toast.success("Réservation confirmée !");
        setConfirmed(true);
      } else {
        toast.error("Une erreur est survenue.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la réservation.");
    } finally {
      setSubmitting(false);
    }
  };

  const progress = ((confirmed ? 4 : step) / 4) * 100;

  return (
    <div style={responsiveContainer}>
      <motion.div
        layout
        initial={{ opacity: 0, y: 40, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        style={cardStyle}
      >
        {/* ✅ Statut Supabase */}
        <div style={{ textAlign: "center", marginBottom: "1rem" }}>
          {supabaseStatus === "pending" && <p style={{ color: "#6c757d" }}>⏳ Vérification de la connexion à Supabase...</p>}
          {supabaseStatus === "success" && <p style={{ color: "#28a745" }}>✅ Connexion Supabase OK</p>}
          {supabaseStatus === "error" && <p style={{ color: "#dc3545" }}>❌ Erreur de connexion à Supabase</p>}
        </div>

        {/* ✅ Barre de progression */}
        <div
          style={{
            height: "6px",
            background: "#e9ecef",
            borderRadius: "3px",
            marginBottom: "1.5rem",
          }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
            style={{
              height: "100%",
              background: "linear-gradient(90deg, #007bff, #00b4d8)",
              borderRadius: "3px",
            }}
          />
        </div>

        <h1 style={{ textAlign: "center", color: "#222", fontSize: "1.8rem", marginBottom: "1.5rem" }}>
          Réservation
        </h1>

        <AnimatePresence mode="wait">
          {!confirmed && (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4 }}
            >
              {/* ⚙️ Étapes 1–3 : ton contenu actuel ici */}
              <p style={{ textAlign: "center", color: "#6c757d" }}>
                (Contenu des étapes à insérer ici — inchangé par rapport à ta version précédente)
              </p>
            </motion.div>
          )}

          {confirmed && (
            <motion.div
              key="confirmation"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              style={{ textAlign: "center", padding: "2rem" }}
            >
              <h2>🎉 Merci pour votre réservation !</h2>
              <p style={{ marginTop: "1rem" }}>
                Nous avons bien enregistré votre demande pour le{" "}
                <strong>{format(selectedDate, "dd/MM/yyyy")}</strong> à{" "}
                <strong>{selectedHeure}</strong>.
              </p>
              <p>Un e-mail de confirmation vous sera envoyé à {formData.email}.</p>
              <button onClick={() => window.location.reload()} style={{ ...mainButton, marginTop: "1rem" }}>
                Nouvelle réservation
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <ToastContainer position="top-center" autoClose={2500} hideProgressBar />
      </motion.div>
    </div>
  );
}

/* --- Styles --- */
const responsiveContainer = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "linear-gradient(135deg, #f8f9fa 0%, #eef2f3 100%)",
  minHeight: "100vh",
  padding: "1rem",
};

const cardStyle = {
  width: "100%",
  maxWidth: "650px",
  background: "#fff",
  borderRadius: "20px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
  padding: "2rem 2.5rem",
};

const mainButton = {
  backgroundColor: "#007bff",
  color: "white",
  border: "none",
  borderRadius: "8px",
  padding: "0.7rem 1.5rem",
  fontSize: "1rem",
  cursor: "pointer",
  transition: "0.2s ease",
};

export default Reservation;





