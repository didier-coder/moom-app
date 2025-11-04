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
console.log("🔍 process.env.REACT_APP_API_URL =", process.env.REACT_APP_API_URL);

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

  // ✅ Charger les heures depuis Supabase (table "heure")
  useEffect(() => {
    async function fetchHeures() {
      try {
        console.log("🔄 Chargement des heures depuis Supabase...");
        const { data, error } = await supabase.from("heure").select("*").order("horaire", { ascending: true });
        if (error) throw error;
        const horaires = data.map((h) => h.horaire);
        console.log("✅ Heures chargées :", horaires);
        setHeuresDispo(horaires);
      } catch (err) {
        console.error("❌ Erreur de chargement des heures :", err.message);
        toast.error("Impossible de charger les heures disponibles.");
      }
    }
    fetchHeures();
  }, []);

  const handleReservation = async () => {
    if (selectedDate < new Date().setHours(0, 0, 0, 0)) {
      toast.error("Vous ne pouvez pas réserver pour une date passée.");
      return;
    }

    if (!selectedDate || !selectedHeure || !formData.prenom || !formData.nom || !formData.email || !formData.tel) {
      toast.warning("Merci de compléter tous les champs obligatoires svp.");
      return;
    }

    if (typeClient === "societe") {
      const tvaRegex = /^BE0\d{9}$/;
      if (!formData.tva || !tvaRegex.test(formData.tva.trim())) {
        toast.warning("Numéro de TVA belge invalide (ex : BE0123456789).");
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

      const url = `${process.env.REACT_APP_API_URL}/api/reservations`;
      console.log("📦 Envoi des données :", data);
      const res = await axios.post(url, data);

      if (res?.data?.success) {
        toast.success("Réservation confirmée !");
        setConfirmed(true);
      } else {
        toast.error("Erreur lors de la réservation.");
      }
    } catch (error) {
      console.error("❌ Erreur d'envoi :", error);
      toast.error("Erreur de communication avec le serveur.");
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

