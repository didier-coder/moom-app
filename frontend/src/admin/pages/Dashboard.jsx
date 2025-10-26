import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  // 🎯 Définition des tuiles
  const tiles = [
    {
      icon: "📅",
      title: "Calendrier",
      desc: "Vue globale des réservations par jour et heure.",
      path: "/admin/calendrier",
    },
    {
      icon: "🧾",
      title: "Réservations",
      desc: "Liste complète des réservations clients.",
      path: "/admin/reservations",
    },
    {
      icon: "👥",
      title: "Clients",
      desc: "Historique et informations clients.",
      path: "/admin/clients",
    },
    {
      icon: "🍽️",
      title: "Restaurants",
      desc: "Gérez vos établissements et coordonnées.",
      path: "/admin/restaurants",
    },
    {
      icon: "🕰️",
      title: "Horaires",
      desc: "Définissez les heures d’ouverture et de service.",
      path: "/admin/horaires",
    },
    {
      icon: "🚪",
      title: "Fermetures",
      desc: "Planifiez les jours de fermeture.",
      path: "/admin/fermetures",
    },
    {
      icon: "✅",
      title: "Disponibilités",
      desc: "Créez et ajustez les créneaux disponibles.",
      path: "/admin/disponibilites",
    },
  ];

  // 🎬 Animation globale
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.12 },
    },
  };

  // 🎞 Animation individuelle
  const item = {
    hidden: { opacity: 0, scale: 0.9, y: 10 },
    show: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  return (
    <div className="min-h-screen w-full bg-[#bad5b7]/20 p-8">
      {/* 🧭 Titre principal */}
      <h1 className="text-3xl font-bold text-[#1a1a1a] mb-10">
        Tableau de bord MOOM
      </h1>

      {/* 🟩 Grille animée des tuiles */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        {tiles.map((tile, index) => (
          <motion.div
            key={index}
            variants={item}
            whileHover={{
              scale: 1.05,
              boxShadow: "0px 6px 20px rgba(0,0,0,0.15)",
            }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate(tile.path)}
            className="cursor-pointer bg-gradient-to-br from-[#bad5b7] to-[#a8c9a3] rounded-2xl p-6 flex flex-col justify-between shadow-md hover:shadow-lg transition-all"
          >
            <div className="text-5xl mb-4">{tile.icon}</div>
            <div>
              <h2 className="text-lg font-bold text-[#1a1a1a] mb-1">
                {tile.title}
              </h2>
              <p className="text-sm text-[#1a1a1a]/80">{tile.desc}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* 🕒 Bloc “Récents” */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="mt-12"
      >
        <h2 className="text-xl font-semibold text-[#1a1a1a] mb-4">
          Réservations récentes
        </h2>
        <div className="bg-white rounded-xl shadow-sm p-4 text-[#1a1a1a]/70">
          <p>Aucune donnée à afficher pour le moment.</p>
        </div>
      </motion.div>
    </div>
  );
}
