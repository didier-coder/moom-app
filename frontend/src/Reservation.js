import React, { useState, useEffect } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format, isToday } from "date-fns";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaUserFriends, FaCalendarAlt } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "./supabaseClient";
import "./App.css";

console.log("✅ Reservation.js chargé !");

// 🎨 Palette
const themeColor = "#bad5b7";
const themeHover = "#a8c9a3";
const themeText = "#000000";

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

  // 🎨 Style global boutons (hover/focus)
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = globalButtonStyle;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // ✅ Génération des horaires
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

  //  Filtrage des heures selon la date et le service
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

const handleReservation = async () => {
  if (selectedDate < new Date().setHours(0, 0, 0, 0)) {
    toast.error("Vous ne pouvez pas réserver pour une date passée.");
    return;
  }

  // ✅ Champs obligatoires de base
  if (
    !selectedDate ||
    !selectedHeure ||
    !formData.prenom ||
    !formData.nom ||
    !formData.email ||
    !formData.tel
  ) {
    toast.warning("Merci de compléter tous les champs obligatoires svp.");
    return;
  }

  // 🇧🇪 Vérification TVA belge si société
  if (typeClient === "societe") {
    if (!formData.tva || formData.tva.trim() === "") {
      toast.warning("Merci d'indiquer votre numéro de TVA.");
      return;
    }

    const tvaRegex = /^BE0\d{9}$/;
    if (!tvaRegex.test(formData.tva.trim())) {
      toast.warning("Merci d'entrer un numéro de TVA belge valide (ex : BE0123456789).");
      return;
    }
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

    console.log("📦 Données envoyées :", data);

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
        {/*  Barre de progression */}
        <div style={progressBarContainer}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
            style={progressBarFill}
          />
        </div>

        <h1 style={title}>Réservation</h1>

        <AnimatePresence mode="wait">
          {!confirmed && (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4 }}
            >
              {step === 1 && (
                <Step1
                  {...{ personnes, setPersonnes, selectedDate, setSelectedDate, service, setService, heuresDispo, selectedHeure, setSelectedHeure, setStep }}
                />
              )}

              {step === 2 && <Step2 {...{ setTypeClient, setStep }} />}

              {step === 3 && (
                <Step3
                  {...{ typeClient, formData, setFormData, handleReservation, submitting, setStep }}
                />
              )}
            </motion.div>
          )}

          {confirmed && <Confirmation {...{ selectedDate, selectedHeure, formData }} />}
        </AnimatePresence>

        <ToastContainer position="top-center" autoClose={2500} hideProgressBar />
      </motion.div>
    </div>
  );
}

/* --- Étapes 1--- */
function Step1({ personnes, setPersonnes, selectedDate, setSelectedDate, service, setService, heuresDispo, selectedHeure, setSelectedHeure, setStep }) {
  return (
    <div style={{ textAlign: "center" }}>
      <label>Nombre de personnes :</label>
      <div style={inputBox}>
        <FaUserFriends style={iconStyle} />
        <input
          type="number"
          min="1"
          max="12"
          value={personnes}
          onChange={(e) => setPersonnes(e.target.value)}
          style={fieldStyle}
        />
      </div>

      <label>Date :</label>
      <div style={inputBox}>
        <FaCalendarAlt style={iconStyle} />
        <DatePicker
          selected={selectedDate}
          onChange={setSelectedDate}
          dateFormat="dd/MM/yyyy"
          minDate={new Date()}
          placeholderText="Sélectionnez une date"
          style={fieldStyle}
        />
      </div>

      <label>Service :</label>
      <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginTop: "0.5rem" }}>
        <button
          onClick={() => setService("lunch")}
          style={{
            ...serviceButton,
            backgroundColor: service === "lunch" ? themeColor : "#f1f3f5",
            color: service === "lunch" ? themeText : "#333",
          }}
        >
          Midi
        </button>
        <button
          onClick={() => setService("diner")}
          style={{
            ...serviceButton,
            backgroundColor: service === "diner" ? themeColor : "#f1f3f5",
            color: service === "diner" ? themeText : "#333",
          }}
        >
          Soir
        </button>
      </div>

      <label>Heures disponibles :</label>
      <div style={heuresGrid}>
        {heuresDispo.map((h) => (
          <button
            key={h}
            onClick={() => setSelectedHeure(h)}
            style={{
              backgroundColor: selectedHeure === h ? themeColor : "#f1f3f5",
              color: selectedHeure === h ? themeText : "#333",
              border: "1px solid #dee2e6",
              borderRadius: "8px",
              padding: "0.6rem 0",
              cursor: "pointer",
            }}
          >
            {h}
          </button>
        ))}
      </div>

      <button
        onClick={() => (selectedHeure ? setStep(2) : toast.warning("Choisissez une heure !"))}
        style={mainButton}
      >
        Suivant →
      </button>
    </div>
  );
}
/* --- Étapes 2--- */
function Step2({ setTypeClient, setStep }) {
  return (
    <div style={{ textAlign: "center" }}>
      <h3 style={{ marginBottom: "1rem" }}>Vous êtes :</h3>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          marginTop: "1rem",
        }}
      >
        <button
          onClick={() => {
            setTypeClient("societe");
            setStep(3);
          }}
          style={{ ...mainButton, minWidth: "140px", marginTop: "1.5rem" }}
        >
          Société
        </button>
        <button
          onClick={() => {
            setTypeClient("particulier");
            setStep(3);
          }}
          style={{
            ...mainButton,
            backgroundColor: themeHover,
            color: themeText,
            minWidth: "140px",
            marginTop: "1.5rem"
          }}
        >
          Particulier
        </button>
      </div>

      <div style={{ marginTop: "1.5rem" }}>
        <button onClick={() => setStep(1)} style={backLink}>
          ← Retour
        </button>
      </div>
    </div>
  );
}
/* --- Étapes 3--- */
function Step3({ typeClient, formData, setFormData, handleReservation, submitting, setStep }) {
  return (
    <div>
      {/* Si le client est une société */}
      {typeClient === "societe" && (
        <>
          <input
            placeholder="Nom de société"
            value={formData.societe}
            onChange={(e) => setFormData({ ...formData, societe: e.target.value })}
            style={inputStyle}
          />
          <input
            placeholder="N° TVA (ex : BE0123456789)"
            value={formData.tva}
            maxLength={12}
            onChange={(e) => setFormData({ ...formData, tva: e.target.value.toUpperCase() })}
            style={inputStyle}
          />
        </>
      )}

      {/* Champs de base */}
      <input
        placeholder="Prénom *"
        value={formData.prenom}
        required
        onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
        style={inputStyle}
      />
      <input
        placeholder="Nom *"
        value={formData.nom}
        required
        onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
        style={inputStyle}
      />
      <input
        placeholder="Téléphone *"
        type="tel"
        required
        value={formData.tel}
        onChange={(e) => setFormData({ ...formData, tel: e.target.value })}
        style={inputStyle}
      />
      <input
        placeholder="Email *"
        type="email"
        required
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        style={inputStyle}
      />
      <textarea
        placeholder="Remarque (facultatif)"
        value={formData.remarque}
        onChange={(e) => setFormData({ ...formData, remarque: e.target.value })}
        style={{ ...inputStyle, height: "80px" }}
      />

      {/* Boutons */}
      <div style={{ textAlign: "center", marginTop: "1rem" }}>
        <button onClick={handleReservation} disabled={submitting} style={mainButton}>
          {submitting ? "Envoi en cours..." : "Confirmer la réservation"}
        </button>
        <br />
        <button onClick={() => setStep(2)} style={backLink}>
          ← Retour
        </button>
      </div>
    </div>
  );
}

function Confirmation({ selectedDate, selectedHeure, formData }) {
  return (
    <motion.div
      key="confirmation"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
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
  );
}

/* --- Styles --- */
const responsiveContainer = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "#bad5b7",
  minHeight: "100vh",
  padding: "1rem",
};

const cardStyle = {
  width: "100%",
  maxWidth: "650px",
  background: "rgba(255, 255, 255, 0.85)",
  backdropFilter: "blur(6px)",
  borderRadius: "20px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
  padding: "2rem 2.5rem",
};

const inputBox = {
  display: "flex",
  alignItems: "center",
  background: "#fff",
  border: "1px solid #dee2e6",
  borderRadius: "8px",
  padding: "0.4rem 0.8rem",
  marginTop: "0.4rem",
  marginBottom: "1rem",
  width: "100%",
  boxSizing: "border-box",
};

const heuresGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "0.8rem",
  marginTop: "1rem",
  marginBottom: "1rem",
};

const iconStyle = { color: themeColor, marginRight: "0.6rem" };

const fieldStyle = {
  border: "none",
  outline: "none",
  background: "transparent",
  width: "100%",
  fontSize: "1rem",
};

const inputStyle = {
  width: "100%",
  marginBottom: "0.8rem",
  padding: "0.8rem",
  borderRadius: "8px",
  border: "1px solid #ced4da",
  fontSize: "1rem",
  boxSizing: "border-box",
};

const progressBarContainer = {
  height: "6px",
  background: "#e9ecef",
  borderRadius: "3px",
  marginBottom: "1.5rem",
};

const progressBarFill = {
  height: "100%",
  background: `linear-gradient(90deg, ${themeColor}, ${themeHover})`,
  borderRadius: "3px",
};

const title = {
  textAlign: "center",
  color: "#222",
  fontSize: "1.8rem",
  marginBottom: "1.5rem",
};

const mainButton = {
  backgroundColor: themeColor,
  color: themeText,
  border: "none",
  borderRadius: "8px",
  padding: "0.7rem 1.5rem",
  fontSize: "1rem",
  cursor: "pointer",
  transition: "background 0.2s ease",
};

const serviceButton = {
  border: "1px solid #ccc",
  borderRadius: "8px",
  padding: "0.6rem 1rem",
  fontSize: "1rem",
  cursor: "pointer",
};

const backLink = {
  border: "none",
  background: "none",
  color: "#6c757d",
  marginTop: "0.5rem",
  cursor: "pointer",
  textDecoration: "underline",
};

// 💚 Style global pour harmoniser les boutons
const globalButtonStyle = `
  button {
    outline: none !important;
    box-shadow: none !important;
    transition: all 0.2s ease;
  }

  button:hover {
    background-color: #a8c9a3 !important; /* Vert plus soutenu au survol */
  }

  button:focus {
    outline: none !important;
    box-shadow: 0 0 0 3px rgba(186, 213, 183, 0.6) !important; /* Halo vert doux */
  }
`;

export default Reservation;
