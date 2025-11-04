import React, { useState, useEffect } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaUserFriends, FaCalendarAlt } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "./supabaseClient";
import "./App.css";

// 🎨 Thème graphique
const themeColor = "#bad5b7";
const themeHover = "#a8c9a3";
const themeText = "#000000";

function Reservation() {
  // 🧩 États
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedHeure, setSelectedHeure] = useState("");
  const [personnes, setPersonnes] = useState(2);
  const [service, setService] = useState("lunch");
  const [typeClient, setTypeClient] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [heuresDispo, setHeuresDispo] = useState([]);
  const [heuresFiltrees, setHeuresFiltrees] = useState([]);
  const [supabaseStatus, setSupabaseStatus] = useState("checking");

  const [formData, setFormData] = useState({
    societe: "",
    tva: "",
    prenom: "",
    nom: "",
    tel: "",
    email: "",
    remarque: "",
  });

  const API_URL = process.env.REACT_APP_API_URL || "https://moom-app.vercel.app";

  // ✅ Vérifie la connexion backend
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const res = await fetch(`${API_URL}/api/ping`);
        if (res.ok) {
          console.log("✅ Connexion backend OK");
          setSupabaseStatus("connected");
        } else throw new Error("ping échoué");
      } catch (err) {
        console.error("❌ Erreur connexion backend :", err);
        setSupabaseStatus("error");
      }
    };
    checkBackend();
  }, [API_URL]);

  // ✅ Charge les heures disponibles
  useEffect(() => {
    const loadHeures = async () => {
      try {
        console.log("🔄 Chargement des heures depuis :", `${API_URL}/api/heures`);
        const res = await axios.get(`${API_URL}/api/heures`);
        console.log("✅ Heures chargées :", res.data);
        setHeuresDispo(res.data.map((h) => h.horaire));
      } catch (err) {
        console.error("❌ Erreur chargement heures :", err);
        toast.error("Erreur lors du chargement des heures disponibles.");
      }
    };
    loadHeures();
  }, [API_URL]);

  // ✅ Filtrage dynamique (midi/soir + suppression secondes + heures passées)
  useEffect(() => {
    if (heuresDispo.length > 0) {
      const maintenant = new Date();
      const isToday = selectedDate.toDateString() === maintenant.toDateString();

      const filtrage = heuresDispo.filter((h) => {
        const heure = h.slice(0, 5);
        const [hh, mm] = heure.split(":").map(Number);
        const timeValue = hh * 60 + mm;
        const nowValue = maintenant.getHours() * 60 + maintenant.getMinutes();

        if (service === "lunch" && (h < "12:00:00" || h > "15:00:00")) return false;
        if (service === "diner" && (h < "18:00:00" || h > "22:00:00")) return false;

        if (isToday && timeValue <= nowValue) return false;

        return true;
      });

      setHeuresFiltrees(filtrage);
    }
  }, [heuresDispo, service, selectedDate]);

  // 🧾 Gérer les changements dans les champs du formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 📅 Envoi de la réservation
  const handleReservation = async () => {
    if (
      !selectedDate ||
      !selectedHeure ||
      !formData.prenom ||
      !formData.nom ||
      !formData.email ||
      !formData.tel
    ) {
      toast.warning("Merci de compléter tous les champs obligatoires svp.");
      return;
    }

    if (typeClient === "societe") {
      const tvaRegex = /^BE0\\d{9}$/;
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

      const url = `${API_URL}/api/reservations`;
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

  // 🪄 Interface principale
  return (
    <div className="reservation-container">
      <ToastContainer position="top-right" />
      <h1 className="title">Réserver une table</h1>

      {supabaseStatus === "checking" && (
        <p>⏳ Vérification de la connexion au serveur...</p>
      )}

      {supabaseStatus === "error" && (
        <p>❌ Impossible de se connecter au serveur.</p>
      )}

      {/* Étape 1 : Sélection date, service et heure */}
      {supabaseStatus === "connected" && step === 1 && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="card">
          <label>Date de réservation</label>
          <div className="input-group">
            <FaCalendarAlt />
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              dateFormat="dd/MM/yyyy"
              minDate={new Date()}
            />
          </div>

          <div className="service-buttons">
            <button
              className={service === "lunch" ? "active" : ""}
              onClick={() => setService("lunch")}
            >
              Midi
            </button>
            <button
              className={service === "diner" ? "active" : ""}
              onClick={() => setService("diner")}
            >
              Soir
            </button>
          </div>

          <label>Heures disponibles :</label>
          <div className="heures-grid">
            {heuresFiltrees.length === 0 && <p>Aucune heure disponible.</p>}
            {heuresFiltrees.map((h) => {
              const horaire = h.slice(0, 5);
              return (
                <button
                  key={h}
                  onClick={() => setSelectedHeure(h)}
                  className={`heure-button ${selectedHeure === h ? "active" : ""}`}
                >
                  {horaire}
                </button>
              );
            })}
          </div>

          <button
            onClick={() =>
              selectedHeure ? setStep(2) : toast.warning("⏰ Choisissez une heure !")
            }
            className="main-button"
          >
            Suivant →
          </button>
        </motion.div>
      )}

      {/* Étape 2 : Infos client */}
      {step === 2 && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="card">
          <label>Prénom</label>
          <input name="prenom" value={formData.prenom} onChange={handleChange} />
          <label>Nom</label>
          <input name="nom" value={formData.nom} onChange={handleChange} />
          <label>Email</label>
          <input name="email" value={formData.email} onChange={handleChange} />
          <label>Téléphone</label>
          <input name="tel" value={formData.tel} onChange={handleChange} />
          <label>Remarque</label>
          <textarea name="remarque" value={formData.remarque} onChange={handleChange}></textarea>

          <div className="buttons">
            <button onClick={() => setStep(1)}>Retour</button>
            <button style={{ backgroundColor: themeColor }} onClick={handleReservation}>
              {submitting ? "Envoi..." : "Confirmer"}
            </button>
          </div>
        </motion.div>
      )}

      {/* Étape 3 : Confirmation */}
      <AnimatePresence>
        {confirmed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="confirmation"
          >
            <h2>🎉 Merci pour votre réservation !</h2>
            <p>Un email de confirmation vous a été envoyé.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Reservation;


