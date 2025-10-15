import { useEffect, useState } from "react";
import axios from "axios";
import { format } from "date-fns";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function FermeturesAdmin() {
  const [fermetures, setFermetures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState("hebdomadaire");
  const [jourSemaine, setJourSemaine] = useState("Lundi");
  const [dateExceptionnelle, setDateExceptionnelle] = useState("");
  const [raison, setRaison] = useState("");
  const [actif, setActif] = useState(true);

  const fetchFermetures = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/fermetures`);
      setFermetures(res.data.data || []);
    } catch (err) {
      toast.error("Erreur lors du chargement des fermetures");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFermetures();
  }, []);

  const handleAdd = async () => {
    try {
      const payload = {
        type,
        jour_semaine: type === "hebdomadaire" ? jourSemaine : null,
        date_exceptionnelle: type === "exceptionnelle" ? dateExceptionnelle : null,
        raison,
        actif,
        restaurant_id: 1,
      };

      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/fermetures`, payload);
      if (res.data.success) {
        toast.success("Fermeture ajoutée avec succès");
        fetchFermetures();
        setRaison("");
        setDateExceptionnelle("");
      } else {
        toast.error("Erreur lors de l’ajout");
      }
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de l’ajout de la fermeture");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cette fermeture ?")) return;
    try {
      const res = await axios.delete(`${process.env.REACT_APP_API_URL}/api/fermetures/${id}`);
      if (res.data.success) {
        toast.success("Fermeture supprimée");
        fetchFermetures();
      } else {
        toast.error("Erreur lors de la suppression");
      }
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la suppression");
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif", maxWidth: "700px", margin: "auto" }}>
      <h1 style={{ textAlign: "center" }}>Gestion des fermetures</h1>

      <div style={{ marginBottom: "1rem" }}>
        <label>Type de fermeture :</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          style={{ marginLeft: "1rem", padding: "0.5rem" }}
        >
          <option value="hebdomadaire">Hebdomadaire</option>
          <option value="exceptionnelle">Exceptionnelle</option>
        </select>
      </div>

      {type === "hebdomadaire" ? (
        <div style={{ marginBottom: "1rem" }}>
          <label>Jour de la semaine :</label>
          <select
            value={jourSemaine}
            onChange={(e) => setJourSemaine(e.target.value)}
            style={{ marginLeft: "1rem", padding: "0.5rem" }}
          >
            <option>Lundi</option>
            <option>Mardi</option>
            <option>Mercredi</option>
            <option>Jeudi</option>
            <option>Vendredi</option>
            <option>Samedi</option>
            <option>Dimanche</option>
          </select>
        </div>
      ) : (
        <div style={{ marginBottom: "1rem" }}>
          <label>Date exceptionnelle :</label>
          <input
            type="date"
            value={dateExceptionnelle}
            onChange={(e) => setDateExceptionnelle(e.target.value)}
            style={{ marginLeft: "1rem", padding: "0.5rem" }}
          />
        </div>
      )}

      <div style={{ marginBottom: "1rem" }}>
        <label>Raison :</label>
        <input
          type="text"
          value={raison}
          onChange={(e) => setRaison(e.target.value)}
          placeholder="Ex: Fermeture annuelle"
          style={{ marginLeft: "1rem", padding: "0.5rem", width: "60%" }}
        />
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label>
          <input
            type="checkbox"
            checked={actif}
            onChange={(e) => setActif(e.target.checked)}
            style={{ marginRight: "0.5rem" }}
          />
          Actif
        </label>
      </div>

      <button
        onClick={handleAdd}
        style={{
          backgroundColor: "#007bff",
          color: "#fff",
          border: "none",
          padding: "0.7rem 1.2rem",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        ➕ Ajouter
      </button>

      <h2 style={{ marginTop: "2rem" }}>Liste des fermetures</h2>

      {loading ? (
        <p>Chargement...</p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "1rem",
            fontSize: "0.95rem",
          }}
        >
          <thead>
            <tr style={{ background: "#f8f9fa", borderBottom: "2px solid #dee2e6" }}>
              <th style={{ padding: "0.5rem" }}>Type</th>
              <th style={{ padding: "0.5rem" }}>Jour / Date</th>
              <th style={{ padding: "0.5rem" }}>Raison</th>
              <th style={{ padding: "0.5rem" }}>Actif</th>
              <th style={{ padding: "0.5rem" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {fermetures.map((f) => (
              <tr key={f.id} style={{ borderBottom: "1px solid #dee2e6" }}>
                <td style={{ padding: "0.5rem" }}>{f.type}</td>
                <td style={{ padding: "0.5rem" }}>
                  {f.type === "hebdomadaire"
                    ? f.jour_semaine
                    : f.date_exceptionnelle
                    ? format(new Date(f.date_exceptionnelle), "dd/MM/yyyy")
                    : ""}
                </td>
                <td style={{ padding: "0.5rem" }}>{f.raison || "-"}</td>
                <td style={{ padding: "0.5rem" }}>{f.actif ? "✅" : "❌"}</td>
                <td style={{ padding: "0.5rem" }}>
                  <button
                    onClick={() => handleDelete(f.id)}
                    style={{
                      background: "#dc3545",
                      color: "#fff",
                      border: "none",
                      padding: "0.4rem 0.7rem",
                      borderRadius: "6px",
                      cursor: "pointer",
                    }}
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <ToastContainer position="top-center" autoClose={2500} hideProgressBar />
    </div>
  );
}

export default FermeturesAdmin;
