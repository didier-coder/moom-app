import { useEffect, useState } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
    const h = selectedDate.getHours();
    // On précharge les créneaux lunch ou dîner selon la période
    if (h < 16) setHeuresDispo(heuresLunch);
    else setHeuresDispo(heuresDiner);
  }, [selectedDate]);

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
        padding: "2rem",
        fontFamily: "Inter, sans-serif",
        maxWidth: "600px",
        margin: "auto",
        background: "#fff",
        borderRadius: "20px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
      }}
    >
      <h1 style={{ textAlign: "center", marginBottom: "1.5rem", color: "#222" }}>
        Réservation
      </h1>

      {/* Étape 1 : Base */}
      {step === 1 && (
        <div style={{ textAlign: "center" }}>
          <div style={{ marginBottom: "1rem" }}>
            <label>Nombre de personnes :</label>
            <br />
            <input
              type="number"
              min="1"
              max="12"
              value={personnes}
              onChange={(e) => setPersonnes(e.target.value)}
              style={{
                width: "80px",
                padding: "0.5rem",
                textAlign: "center",
                borderRadius: "8px",
                border: "1px solid #ccc",
              }}
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label>Date :</label>
            <br />
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              dateFormat="dd/MM/yyyy"
              minDate={new Date()}
              className="border p-2 rounded"
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label>Heure :</label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(80px, 1fr))",
                gap: "0.6rem",
                marginTop: "0.5rem",
              }}
            >
              {heuresDispo.map((h) => (
                <button
                  key={h}
                  onClick={() => setSelectedHeure(h)}
                  style={{
                    backgroundColor: selectedHeure === h ? "#007bff" : "#f5f5f5",
                    color: selectedHeure === h ? "#fff" : "#333",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    padding: "0.6rem 0",
                    cursor: "pointer",
                    transition: "0.2s",
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
            style={{
              backgroundColor: "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "0.7rem 1.5rem",
              cursor: "pointer",
            }}
          >
            Suivant →
          </button>
        </div>
      )}

      {/* Étape 2 : Type de client */}
      {step === 2 && (
        <div style={{ textAlign: "center" }}>
          <h3>Vous êtes :</h3>
          <div style={{ marginBottom: "1rem" }}>
            <button
              onClick={() => {
                setTypeClient("societe");
                setStep(3);
              }}
              style={{
                marginRight: "1rem",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "8px",
                padding: "0.7rem 1.2rem",
                cursor: "pointer",
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
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "8px",
                padding: "0.7rem 1.2rem",
                cursor: "pointer",
              }}
            >
              Particulier
            </button>
          </div>
          <button onClick={() => setStep(1)} style={{ border: "none", background: "none", color: "#777" }}>
            ← Retour
          </button>
        </div>
      )}

      {/* Étape 3 : Formulaire selon type */}
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
                backgroundColor: submitting ? "#ccc" : "#007bff",
                color: "white",
                border: "none",
                borderRadius: "8px",
                padding: "0.7rem 1.5rem",
                cursor: submitting ? "not-allowed" : "pointer",
              }}
            >
              Confirmer la réservation
            </button>
            <br />
            <button
              onClick={() => setStep(2)}
              style={{ border: "none", background: "none", color: "#777", marginTop: "0.5rem" }}
            >
              ← Retour
            </button>
          </div>
        </div>
      )}

      <ToastContainer position="top-center" autoClose={2500} hideProgressBar />
    </div>
  );
}

const inputStyle = {
  width: "100%",
  marginBottom: "0.7rem",
  padding: "0.7rem",
  borderRadius: "8px",
  border: "1px solid #ccc",
  fontSize: "1rem",
  boxSizing: "border-box",
};

export default App;




