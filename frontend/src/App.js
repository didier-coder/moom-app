import { useEffect, useState } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaUserFriends, FaCalendarAlt, FaClock } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import "./App.css";

function App() {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedHeure, setSelectedHeure] = useState("");
  const [personnes, setPersonnes] = useState(2);
  const [service, setService] = useState("lunch");
  const [typeClient, setTypeClient] = useState("");
  const [formData, setFormData] = useState({
    societe: "",
    tva: "",
    prenom: "",
    nom: "",
    tel: "",
    email: "",
    remarque: "",
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [heuresDispo, setHeuresDispo] = useState([]);

  // ✅ Génère dynamiquement les créneaux horaires
function genererHeures(debut, fin, intervalleMinutes) {
  const heures = [];
  let [h, m] = debut.split(":").map(Number);
  const [hFin, mFin] = fin.split(":").map(Number);

  while (h < hFin || (h === hFin && m <= mFin)) {
    const hh = String(h).padStart(2, "0");
    const mm = String(m).padStart(2, "0");
    heures.push(`${hh}:${mm}`);
    m += intervalleMinutes;
    if (m >= 60) {
      h++;
      m -= 60;
    }
  }
  return heures;
}

// ✅ Création automatique des horaires Lunch et Dîner
const heuresLunch = genererHeures("12:00", "14:30", 15);
const heuresDiner = genererHeures("18:00", "22:00", 15);



  useEffect(() => {
    const now = new Date();
    let heures = service === "lunch" ? [...heuresLunch] : [...heuresDiner];

    // Filtrer les heures déjà passées si la date sélectionnée = aujourd'hui
    if (selectedDate.toDateString() === now.toDateString()) {
      const currentTime = now.getHours() + now.getMinutes() / 60;
      heures = heures.filter((h) => {
        const [hh, mm] = h.split(":").map(Number);
        const timeValue = hh + mm / 60;
        return timeValue > currentTime;
      });
    }

    setHeuresDispo(heures);
  }, [service, selectedDate]);

  const progress = ((confirmed ? 4 : step) / 4) * 100;

  const handleReservation = async () => {
    // Interdit les dates passées (sécurité)
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

  return (
  <div style={responsiveContainer}>
  <motion.div
    layout
    initial={{ opacity: 0, y: 40, scale: 0.98 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.6 }}
    style={cardStyle}
    className="reservation-card"
  >
    <motion.div
      layout
      initial={{ opacity: 0, y: 40, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6 }}
      style={{
        width: "100%",
        maxWidth: "650px",
        background: "#fff",
        borderRadius: "20px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
        padding: "2rem 2.5rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Barre de progression */}
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

      <h1
        style={{
          textAlign: "center",
          color: "#222",
          fontSize: "1.8rem",
          marginBottom: "1.5rem",
        }}
      >
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
            {/* Étape 1 */}
            {step === 1 && (
              <div className="fadeIn" style={{ textAlign: "center" }}>
                <div style={{ marginBottom: "1rem" }}>
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
                </div>

                {/* Champ Date uniformisé */}
                <div style={{ marginBottom: "1rem" }}>
                  <label>Date :</label>
                  <div style={inputBox}>
                    <FaCalendarAlt style={iconStyle} />
                    <DatePicker
                      selected={selectedDate}
                      onChange={(date) => setSelectedDate(date)}
                      dateFormat="dd/MM/yyyy"
                      minDate={new Date()}
                      filterDate={(date) => date >= new Date()}
                      popperPlacement="bottom-start"
                      calendarClassName="datepicker-bootstrap"
                      placeholderText="Sélectionnez une date"
                      style={{
                        flex: 1,
                        border: "none",
                        outline: "none",
                        background: "transparent",
                        fontSize: "1rem",
                        padding: "0.4rem 0.2rem", // garde une respiration sans débordement
                    }}
                />
                  </div>
                </div>

                {/* Service */}
                <div style={{ marginBottom: "1rem" }}>
                  <label>Service :</label>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      gap: "1rem",
                      marginTop: "0.5rem",
                    }}
                  >
                    <button
                      onClick={() => setService("lunch")}
                      style={{
                        ...serviceButton,
                        backgroundColor:
                          service === "lunch" ? "#007bff" : "#f1f3f5",
                        color: service === "lunch" ? "white" : "#333",
                      }}
                    >
                      Midi
                    </button>
                    <button
                      onClick={() => setService("diner")}
                      style={{
                        ...serviceButton,
                        backgroundColor:
                          service === "diner" ? "#007bff" : "#f1f3f5",
                        color: service === "diner" ? "white" : "#333",
                      }}
                    >
                      Soir
                    </button>
                  </div>
                </div>

                {/* Heures disponibles */}
                <div style={{ marginBottom: "1rem" }}>
                  <label>
                    <FaClock style={{ marginRight: "0.3rem" }} />
                    Heures disponibles :
                  </label>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))",
                      gap: "0.8rem",
                      justifyContent: "center",
                      alignItems: "center",
                      marginTop: "0.7rem",
                      maxWidth: "400px",
                      marginLeft: "auto",
                      marginRight: "auto",
                    }}
                  >
                    {heuresDispo.map((h) => (
                      <button
                        key={h}
                        onClick={() => setSelectedHeure(h)}
                        style={{
                          backgroundColor:
                            selectedHeure === h ? "#007bff" : "#f1f3f5",
                          color: selectedHeure === h ? "#fff" : "#333",
                          border: "1px solid #dee2e6",
                          borderRadius: "8px",
                          padding: "0.6rem 0",
                          cursor: "pointer",
                          transition: "0.2s ease",
                        }}
                      >
                        {h}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() =>
                    selectedHeure
                      ? setStep(2)
                      : toast.warning("⏰ Choisissez une heure !")
                  }
                  style={mainButton}
                >
                  Suivant →
                </button>
              </div>
            )}

            {/* Étape 2 */}
            {step === 2 && (
              <div className="fadeIn" style={{ textAlign: "center" }}>
                <h3>Vous êtes :</h3>
                <div
                  style={{
                    marginTop: "1rem",
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "1rem",
                    flexWrap: "wrap", // ✅ permet de passer sur deux lignes si écran étroit
              }}
            >
            <button
                onClick={() => {
                setTypeClient("societe");
                setStep(3);
            }}
              style={{
                ...mainButton,
                    backgroundColor: "#007bff",
                    minWidth: "140px",
              }}
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
                      backgroundColor: "#28a745",
                      minWidth: "140px",
              }}
            >
                Particulier
                </button>
              </div>
            )}

            {/* Étape 3 */}
            {step === 3 && (
              <div>
                {typeClient === "societe" && (
                  <>
                    <input
                      placeholder="Nom de société"
                      value={formData.societe}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          societe: e.target.value,
                        })
                      }
                      style={inputStyle}
                    />
                    <input
                      placeholder="N° TVA"
                      value={formData.tva}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          tva: e.target.value,
                        })
                      }
                      style={inputStyle}
                    />
                  </>
                )}

                <input
                  placeholder="Prénom"
                  value={formData.prenom}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      prenom: e.target.value,
                    })
                  }
                  style={inputStyle}
                />
                <input
                  placeholder="Nom"
                  value={formData.nom}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      nom: e.target.value,
                    })
                  }
                  style={inputStyle}
                />
                <input
                  placeholder="Téléphone"
                  value={formData.tel}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tel: e.target.value,
                    })
                  }
                  style={inputStyle}
                />
                <input
                  placeholder="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      email: e.target.value,
                    })
                  }
                  style={inputStyle}
                />
                <textarea
                  placeholder="Remarque (facultatif)"
                  value={formData.remarque}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      remarque: e.target.value,
                    })
                  }
                  style={{ ...inputStyle, height: "80px" }}
                />

                <div style={{ textAlign: "center", marginTop: "1rem" }}>
                  <button
                    onClick={handleReservation}
                    disabled={submitting}
                    style={mainButton}
                  >
                    {submitting
                      ? "Envoi en cours..."
                      : "Confirmer la réservation"}
                  </button>
                  <br />
                  <button onClick={() => setStep(2)} style={backLink}>
                    ← Retour
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Écran final */}
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
            <button
              onClick={() => window.location.reload()}
              style={{ ...mainButton, marginTop: "1rem" }}
            >
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
const inputBox = {
  display: "flex",
  alignItems: "center",
  background: "#f8f9fa",
  border: "1px solid #dee2e6",
  borderRadius: "8px",
  padding: "0.4rem 0.8rem",
  marginTop: "0.4rem",
  width: "100%",
  boxSizing: "border-box", // ✅ empêche tout débordement
};
const iconStyle = { color: "#007bff", marginRight: "0.6rem" };
const fieldStyle = {
  border: "none",
  outline: "none",
  background: "transparent",
  width: "100%",
  fontSize: "1rem",
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
const serviceButton = {
  border: "1px solid #ccc",
  borderRadius: "8px",
  padding: "0.6rem 1rem",
  fontSize: "1rem",
  cursor: "pointer",
  transition: "0.2s ease",
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
const backLink = {
  border: "none",
  background: "none",
  color: "#6c757d",
  marginTop: "0.5rem",
  cursor: "pointer",
  textDecoration: "underline",
};

/* --- Responsive Mobile Enhancements --- */
const responsiveContainer = {
  padding: "1rem",
  width: "100%",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "linear-gradient(135deg, #f8f9fa 0%, #eef2f3 100%)",
  minHeight: "100vh",
  boxSizing: "border-box",
};

const cardStyle = {
  width: "100%",
  maxWidth: "650px",
  background: "#fff",
  borderRadius: "20px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
  padding: "2rem 2.5rem",
  position: "relative",
  overflow: "hidden",
};

const inputStyleMobile = {
  ...inputStyle,
  fontSize: "1rem",
  padding: "0.8rem 1rem",
};

/* --- Responsive media queries --- */
const mobileStyles = `
@media (max-width: 768px) {
  body {
    background: linear-gradient(135deg, #f8f9fa 0%, #eef2f3 100%);
  }

  .reservation-card {
    max-width: 90% !important;
    padding: 1.5rem !important;
  }

  h1 {
    font-size: 1.4rem !important;
  }

  button {
    width: 100% !important;
    margin-bottom: 0.8rem !important;
  }

  input, textarea, select {
    font-size: 1rem !important;
  }

  .date-picker input {
    width: 100% !important;
  }
}
`;

// Injecte le CSS responsive directement
if (typeof document !== "undefined") {
  const styleEl = document.createElement("style");
  styleEl.innerHTML = mobileStyles;
  document.head.appendChild(styleEl);
}


export default App;

