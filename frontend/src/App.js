import { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [dispos, setDispos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDispos = async () => {
      try {
        const date = "2025-10-14"; // tu pourras le rendre dynamique après
        const restaurant_id = 1;
        const url = `${process.env.REACT_APP_API_URL}/api/disponibilites?restaurant_id=${restaurant_id}&date=${date}`;
        const response = await axios.get(url);
        setDispos(response.data.horaires || []);
      } catch (error) {
        console.error("Erreur lors du chargement :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDispos();
  }, []);

  if (loading) return <p> Chargement des disponibilités... </p>;

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1> Disponibilités du jour </h1>{" "}
      {dispos.length > 0 ? (
        <ul>
          {" "}
          {dispos.map((heure, i) => (
            <li key={i}> {heure} </li>
          ))}{" "}
        </ul>
      ) : (
        <p> Aucune disponibilité trouvée. </p>
      )}{" "}
    </div>
  );
}

export default App;
