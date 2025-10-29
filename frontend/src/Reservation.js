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

function Reservation() {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedHeureId, setSelectedHeureId] = useState("");   
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

  /* --- Récupération des heures depuis le backend --- */
  useEffect(() => {
    const fetchHeures = async () => {
      try {
        console.log("🔄 Chargement des heures depuis :", process.env.REACT_APP_API_URL);
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/heures`);
        if (!response.ok) throw new Error(`Erreur HTTP ${response.status}`);
        const data = await response.json();
        console.log("✅ Heures chargées :", data);
        setHeuresDispo(data.map((h) => h.horaire));
      } catch (error) {
        console.error("❌ Erreur chargement heures:", error);
      }
    };
    fetchHeures();
  }, []);

  /* --- Génération des horaires --- */
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

  /* --- Filtrage des heures selon la date et le service --- */
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

  /* --- Envoi de la réservation --- */
  const handleReservation = async () => {
    if (selectedDate < new Date().setHours(0, 0, 0, 0)) {
      toast.error("Vous ne pouvez pas réserver pour une date passée.");
      return;
    }

    if (!selectedDate || !setSelectedHeureId || !formData.prenom || !formData.nom || !formData.email) {
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
        heure_id: selectedHeureId,
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
    <div className="app-container fadeIn">
      <motion.div
        layout
        initial={{ opacity: 0, y: 40, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="reservation-card"
      >
        {/* ✅ Statut Supabase */}
        <div className="supabase-status">
          {supabaseStatus === "pending" && <p>⏳ Vérification de la connexion à Supabase...</p>}
          {supabaseStatus === "success" && <p style={{ color: "#28a745" }}>✅ Connexion Supabase OK</p>}
          {supabaseStatus === "error" && <p style={{ color: "#dc3545" }}>❌ Erreur de connexion à Supabase</p>}
        </div>

        {/* ✅ Barre de progression */}
        <div className="progress-bar-container">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
            className="progress-bar-fill"
          />
        </div>

        <h1 className="title">Réservation</h1>

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
                <div className="step-content">
                  <label>Nombre de personnes :</label>
                  <div className="input-box">
                    <FaUserFriends className="icon" />
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={personnes}
                      onChange={(e) => setPersonnes(e.target.value)}
                      className="field"
                    />
                  </div>

                  <label>Date :</label>
                  <div className="input-box">
                    <FaCalendarAlt className="icon" />
                    <DatePicker
                      selected={selectedDate}
                      onChange={(date) => setSelectedDate(date)}
                      dateFormat="dd/MM/yyyy"
                      minDate={new Date()}
                      filterDate={(date) => date >= new Date()}
                      placeholderText="Sélectionnez une date"
                      className="field"
                    />
                  </div>

                  <label>Service :</label>
                  <div className="service-buttons">
                    <button
                      onClick={() => setService("lunch")}
                      className={`service-button ${service === "lunch" ? "active" : ""}`}
                    >
                      Midi
                    </button>
                    <button
                      onClick={() => setService("diner")}
                      className={`service-button ${service === "diner" ? "active" : ""}`}
                    >
                      Soir
                    </button>
                  </div>

                  <label>Heures disponibles :</label>
                  <div className="heures-grid">
                    {heuresDispo.map((h) => (
                      <button
                        key={h}
                        onClick={() => selectedHeureId(h)}
                        className={`heure-button ${setSelectedHeureId === h ? "active" : ""}`}
                      >
                        {h}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() =>
                      setSelectedHeureId ? setStep(2) : toast.warning("⏰ Choisissez une heure !")
                    }
                    className="main-button"
                  >
                    Suivant →
                  </button>
                </div>
              )}

              {/* Étape 2 */}
              {step === 2 && (
                <div className="step-content">
                  <h3>Vous êtes :</h3>
                  <div className="client-buttons">
                    <button
                      onClick={() => {
                        setTypeClient("societe");
                        setStep(3);
                      }}
                      className="main-button"
                    >
                      Société
                    </button>

                    <button
                      onClick={() => {
                        setTypeClient("particulier");
                        setStep(3);
                      }}
                      className="main-button green"
                    >
                      Particulier
                    </button>
                  </div>

                  <button onClick={() => setStep(1)} className="back-link">
                    ← Retour
                  </button>
                </div>
              )}

              {/* Étape 3 */}
              {step === 3 && (
                <div className="step-content">
                  {typeClient === "societe" && (
                    <>
                      <input
                        placeholder="Nom de société"
                        value={formData.societe}
                        onChange={(e) => setFormData({ ...formData, societe: e.target.value })}
                        className="input-field"
                      />
                      <input
                        placeholder="N° TVA"
                        value={formData.tva}
                        onChange={(e) => setFormData({ ...formData, tva: e.target.value })}
                        className="input-field"
                      />
                    </>
                  )}

                  <input
                    placeholder="Prénom"
                    value={formData.prenom}
                    onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                    className="input-field"
                  />
                  <input
                    placeholder="Nom"
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    className="input-field"
                  />
                  <input
                    placeholder="Téléphone"
                    value={formData.tel}
                    onChange={(e) => setFormData({ ...formData, tel: e.target.value })}
                    className="input-field"
                  />
                  <input
                    placeholder="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-field"
                  />
                  <textarea
                    placeholder="Remarque (facultatif)"
                    value={formData.remarque}
                    onChange={(e) => setFormData({ ...formData, remarque: e.target.value })}
                    className="input-field"
                    style={{ height: "80px" }}
                  />

                  <button onClick={handleReservation} disabled={submitting} className="main-button">
                    {submitting ? "Envoi en cours..." : "Confirmer la réservation"}
                  </button>
                  <button onClick={() => setStep(2)} className="back-link">
                    ← Retour
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* Confirmation */}
          {confirmed && (
            <motion.div
              key="confirmation"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="confirmation"
            >
              <h2>🎉 Merci pour votre réservation !</h2>
              <p>
                Nous avons bien enregistré votre demande pour le{" "}
                <strong>{format(selectedDate, "dd/MM/yyyy")}</strong> à{" "}
                <strong>{setSelectedHeureId}</strong>.
              </p>
              <p>Un e-mail de confirmation vous sera envoyé à {formData.email}.</p>
              <button onClick={() => window.location.reload()} className="main-button">
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

export default Reservation;

