import { useEffect, useState } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [dispos, setDispos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchDispos = async (date) => {
    setLoading(true);
    try {
      const formattedDate = format(date, "yyyy-MM-dd");
      const restaurant_id = 1;
      const url = `${process.env.REACT_APP_API_URL}/api/disponibilites?restaurant_id=${restaurant_id}&date=${formattedDate}`;
      const response = await axios.get(url);
      setDispos(response.data.horaires || []);
      if (response.data.horaires?.length > 0) {
        toast.info("📅 Disponibilités mises à jour !");
      } else {
        toast.warning("⚠️ Aucune disponibilité ce jour-là.");
      }
    } catch (err) {
      console.error("Erreur lors du chargement :", err);
      toast.error("❌ Impossible de récupérer les disponibilités.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDispos(selectedDate);
  }, [selectedDate]);

  const validateForm = () => {
    if (!name.trim() || !email.trim()) {
      toast.warning("⚠️ Veuillez renseigner votre nom et votre email.");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.warning("⚠️ Adresse e-mail invalide.");
      return false;
    }
    return true;
  };

  const handleReservation = async (heure) => {
    if (!validateForm()) return;
    setSubmitting(true);

    try {
      const formattedDate = format(selectedDate, "yyyy-MM-dd");
      const data = {
        restaurant_id: 1,
        name,
        email,
        date: formattedDate,
        heure,
      };

      const url = `${process.env.REACT_APP_API_URL}/api/reservations`;
      const res = await axios.post(url, data);

      if (res.data.success) {
        toast.success(`✅ Réservation confirmée pour ${formattedDate} à ${heure}.`);
        fetchDispos(selectedDate);
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
        fontFamily: "sans-serif",
        maxWidth: "650px",
        margin: "auto",
      }}
    >
      <h1 style={{ textAlign: "center", marginBottom: "1.5rem" }}>Réservations</h1>

      {/* Sélecteur de date */}
      <div style={{ marginBottom: "1rem", textAlign: "center" }}>
        <label htmlFor="datePicker" style={{ display: "block", marginBottom: "0.5rem" }}>
          Choisissez une date :
        </label>
        <DatePicker
          id="datePicker"
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          dateFormat="dd/MM/yyyy"
          minDate={new Date()}
          className="border p-2 rounded"
        />
      </div>

      {/* Formulaire utilisateur */}
      <div style={{ marginBottom: "1.5rem", textAlign: "center" }}>
        <input
          type="text"
          placeholder="Votre nom"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            marginRight: "0.5rem",
            padding: "0.6rem",
            border: "1px solid #ccc",
            borderRadius: "6px",
          }}
        />
        <input
          type="email"
          placeholder="Votre email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            padding: "0.6rem",
            border: "1px solid #ccc",
            borderRadius: "6px",
          }}
        />
      </div>

      {/* Chargement */}
      {loading && <p style={{ textAlign: "center" }}>Chargement des disponibilités...</p>}

      {/* Liste des disponibilités sous forme de boîtes */}
      {!loading && dispos.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
            gap: "1rem",
            textAlign: "center",
          }}
        >
          {dispos.map((heure, i) => (
            <button
              key={i}
              onClick={() => handleReservation(heure)}
              disabled={submitting}
              style={{
                backgroundColor: submitting ? "#ccc" : "#007bff",
                color: "white",
                border: "none",
                borderRadius: "10px",
                padding: "1rem",
                cursor: submitting ? "not-allowed" : "pointer",
                fontSize: "1rem",
                boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                transition: "transform 0.2s ease, background-color 0.2s ease",
              }}
              onMouseEnter={(e) => {
                if (!submitting) {
                  e.target.style.backgroundColor = "#0056b3";
                  e.target.style.transform = "scale(1.05)";
                }
              }}
              onMouseLeave={(e) => {
                if (!submitting) {
                  e.target.style.backgroundColor = "#007bff";
                  e.target.style.transform = "scale(1)";
                }
              }}
            >
              {heure}
            </button>
          ))}
        </div>
      )}

      {!loading && dispos.length === 0 && (
        <p style={{ textAlign: "center", color: "#777" }}>Aucune disponibilité ce jour-là.</p>
      )}

      <ToastContainer position="top-center" autoClose={2500} hideProgressBar />
    </div>
  );
}

export default App;



