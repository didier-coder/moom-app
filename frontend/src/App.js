import { useEffect, useState } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";

function App() {
  const [dispos, setDispos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const fetchDispos = async (date) => {
    setLoading(true);
    setError(null);
    setMessage("");

    try {
      const formattedDate = format(date, "yyyy-MM-dd");
      const restaurant_id = 1;
      const url = `${process.env.REACT_APP_API_URL}/api/disponibilites?restaurant_id=${restaurant_id}&date=${formattedDate}`;
      const response = await axios.get(url);
      setDispos(response.data.horaires || []);
    } catch (err) {
      console.error("Erreur lors du chargement :", err);
      setError("Impossible de récupérer les disponibilités.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDispos(selectedDate);
  }, [selectedDate]);

  const handleReservation = async (heure) => {
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
        setMessage(`✅ Réservation confirmée à ${heure}`);
        fetchDispos(selectedDate);
      } else {
        setMessage("❌ Une erreur est survenue.");
      }
    } catch (error) {
      console.error(error);
      setMessage("❌ Erreur lors de la réservation.");
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Réservations</h1>

      <div style={{ marginBottom: "1rem" }}>
        <label htmlFor="datePicker">Choisissez une date :</label>
        <br />
        <DatePicker
          id="datePicker"
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          dateFormat="dd/MM/yyyy"
          minDate={new Date()}
          className="border p-2 rounded"
        />
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Votre nom"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ marginRight: "0.5rem", padding: "0.5rem" }}
        />
        <input
          type="email"
          placeholder="Votre email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: "0.5rem" }}
        />
      </div>

      {loading && <p>Chargement des disponibilités...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {message && <p>{message}</p>}

      {!loading && !error && dispos.length > 0 && (
        <ul>
          {dispos.map((heure, i) => (
            <li key={i} style={{ marginBottom: "0.5rem" }}>
              {heure}{" "}
              <button onClick={() => handleReservation(heure)}>Réserver</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
