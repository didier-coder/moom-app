import { useEffect, useState } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format, getHours } from "date-fns";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaUserFriends, FaCalendarAlt, FaClock } from "react-icons/fa";

function App() {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedHeure, setSelectedHeure] = useState("");
  const [personnes, setPersonnes] = useState(2);
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
  const [heuresDispo, setHeuresDispo] = useState([]);

  const heuresLunch = ["12:00", "12:30", "13:00", "13:30", "14:00", "14:30"];
  const heuresDiner = ["18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30"];

  // ✅ Correction : on affiche Lunch si la date choisie est midi–15h, sinon Dîner
  useEffect(() => {
    const hour = getHours(selectedDate);
    if (hour >= 10 && hour < 16) {
      setHeuresDispo(heuresLunch);
    } else {
      setHeuresDispo(heuresDiner);
    }
  }, [selectedDate]);

  const progress = (step / 3) * 100;

  const handleReservation = async () => {
    if (!selectedDate || !selectedHeure || !formData.prenom || !formData.nom || !formData.email) {
      toast.warning("⚠️ Merci de compléter tous les champs obligatoires.");
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
        type: typeClient,
        ...formData,
      };

      const url = `${process.env.REACT_APP_API_URL}/api/reservations`;
      const res = await axios.post(url, data);

      if (res.data.success) {
        toast.success(`✅ Réservation confirmée pour ${formattedDate} à ${selectedHeure}.`);
        setStep(1);
        setFormData({
          societe: "",
          tva: "",
          prenom: "",
          nom: "",
          tel: "",
          email: "",
          remarque: "",
        });
        setSelectedHeure("");
        setTypeClient("");
      } else {
        toast.error("❌ Une erreur est survenue lors de la réservation.");
      }
    } catch (error) {
      console.error(error);
      toast.error("❌ Erreur lors de la réservation.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #f8f9fa 0%, #eef2f3 100%)",
        padding: "2rem",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "650px",
          background: "#fff",
          borderRadius: "16px",
          boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
          padding: "2rem 2.5rem",
          position: "relative",
          overflow: "visible",
        }}
      >
        {/* Barre de progression */}
        <div
          style={{
            height: "6px",
            background: "#e9ecef",
            borderRadius: "3px",
            marginBottom: "1.5rem",
            position: "relative",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              background: "linear-gradient(90deg, #007bff, #00b4d8)",
              borderRadius: "3px",
              transition: "width 0.4s ease",
            }}
          />
        </div>

        <h1 style={{ textAlign: "center", color: "#222", fontSize: "1.8rem", marginBottom: "1.5rem" }}>
          Réservation
        </h1>

        {/* Étape 1 */}
        {step === 1 && (
          <div style={{ textAlign: "center" }}>
            {/* Nombre de personnes */}
            <div style={{ marginBottom: "1rem", position: "relative" }}>
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

            {/* Date */}
            <div style={{ marginBottom: "1rem", position: "relative" }}>
              <label>Date :</label>
              <div style={inputBox}>
                <FaCalendarAlt style={iconStyle} />
                <DatePicker
                  selected={selectedDate}
                  onChange={(date) => setSelectedDate(date)}
                  dateFormat="dd/MM/yyyy"
                  minDate={new Date()}
                  popperPlacement="top-start"
                  popperModifiers={[
                    {
                      name: "offset",
                      options: {
                        offset: [0, 10],
                      },
                    },
                  ]}
                  className="datepicker-custom"
                  calendarClassName="calendar-style"
                />
              </div>
            </div>

            {/* Heure */}
            <div style={{ marginBottom: "1rem" }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.4rem",
                }}
              >
                <FaClock size={18} />
                Heures disponibles :
              </label>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(90px, 1fr))",
                  gap: "0.7rem",
                  marginTop: "0.7rem",
                }}
              >
                {heuresDispo.map((h) => (
                  <button
                    key={h}
                    onClick={() => setSelectedHeure(h)}
                    style={{
                      backgroundColor: selectedHeure === h ? "#007bff" : "#f1f3f5",
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
              onClick={() => {
                if (!selectedHeure) toast.warning("⏰ Choisissez une heure avant de continuer.");
                else setStep(2);
              }}
              style={mainButton}
            >
              Suivant →
            </button>
          </div>
        )}

        <ToastContainer position="top-center" autoClose={2500} hideProgressBar />
      </div>
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
  position: "relative",
  zIndex: 10,
};

const iconStyle = {
  color: "#007bff",
  marginRight: "0.6rem",
};

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
  transition: "background-color 0.2s ease",
};

export default App;








