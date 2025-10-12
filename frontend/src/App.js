import { useEffect, useState } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
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

  const heuresLunch = ["12:00", "12:30", "13:00", "13:30", "14:00", "14:30"];
  const heuresDiner = ["18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30"];
  const [heuresDispo, setHeuresDispo] = useState([]);

  useEffect(() => {
    const hour = new Date().getHours();
    setHeuresDispo(hour < 16 ? heuresLunch : heuresDiner);
  }, []);

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

        {/* Étape 1 */}
        {step === 1 && (
          <div style={{ textAlign: "center" }}>
            {/* Nombre de personnes */}
            <div style={{ marginBottom: "1rem", position: "relative" }}>
              <label>Nombre de personnes :</label>
              <div style={inputBox}>
                <Users style={iconStyle} />
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
            <div style={{ marginBottom: "1rem" }}>
              <label>Date :</label>
              <div style={inputBox}>
                <CalendarDays style={iconStyle} />
                <DatePicker
                  selected={selectedDate}
                  onChange={(date) => setSelectedDate(date)}
                  dateFormat="dd/MM/yyyy"
                  minDate={new Date()}
                  customInput={<input style={fieldStyle} />}
                />
              </div>
            </div>

            {/* Heure */}
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}>
                <Clock size={18} />
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

        {/* Étape 2 */}
        {step === 2 && (
          <div style={{ textAlign: "center" }}>
            <h3 style={{ marginBottom: "1rem", color: "#333" }}>Vous êtes :</h3>
            <div style={{ marginBottom: "1rem" }}>
              <button
                onClick={() => {
                  setTypeClient("societe");
                  setStep(3);
                }}
                style={{ ...mainButton, marginRight: "1rem", backgroundColor: "#007bff" }}
              >
                Société
              </button>
              <button
                onClick={() => {
                  setTypeClient("particulier");
                  setStep(3);
                }}
                style={{ ...mainButton, backgroundColor: "#28a745" }}
              >
                Particulier
              </button>
            </div>
            <button onClick={() => setStep(1)} style={backLink}>
              ← Retour
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
                  onChange={(e) => setFormData({ ...formData, societe: e.target.value })}
                  style={inputStyle}
                />
                <input
                  placeholder="N° TVA"
                  value={formData.tva}
                  onChange={(e) => setFormData({ ...formData, tva: e.target.value })}
                  style={inputStyle}
                />
              </>
            )}

            <input
              placeholder="Prénom"
              value={formData.prenom}
              onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
              style={inputStyle}
            />
            <input
              placeholder="Nom"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              style={inputStyle}
            />
            <input
              placeholder="Téléphone"
              value={formData.tel}
              onChange={(e) => setFormData({ ...formData, tel: e.target.value })}
              style={inputStyle}
            />
            <input
              placeholder="Email"
              type="email"
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

            <div style={{ textAlign: "center", marginTop: "1rem" }}>
              <button
                onClick={handleReservation}
                disabled={submitting}
                style={{
                  ...mainButton,
                  opacity: submitting ? 0.6 : 1,
                  cursor: submitting ? "not-allowed" : "pointer",
                }}
              >
                Confirmer la réservation
              </button>
              <br />
              <button onClick={() => setStep(2)} style={backLink}>
                ← Retour
              </button>
            </div>
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

const inputStyle = {
  width: "100%",
  marginBottom: "0.8rem",
  padding: "0.8rem",
  borderRadius: "8px",
  border: "1px solid #ced4da",
  fontSize: "1rem",
  boxSizing: "border-box",
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

const backLink = {
  border: "none",
  background: "none",
  color: "#6c757d",
  marginTop: "0.5rem",
  cursor: "pointer",
  textDecoration: "underline",
};

export default App;






