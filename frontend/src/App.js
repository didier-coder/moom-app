import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// 🧭 Pages et layout Admin
import Admin from "./admin/Admin";
import Dashboard from "./admin/pages/Dashboard";
import Reservations from "./admin/pages/Reservations";
import Clients from "./admin/pages/Clients";
import Restaurants from "./admin/pages/Restaurants";
import Horaires from "./admin/pages/Horaires";
import Fermetures from "./admin/pages/Fermetures";
import Disponibilites from "./admin/pages/Disponibilites";
// import Reservation from "./Reservation"; // (optionnel, pour le public)

function App() {
  return (
    <Router>
      <Routes>
        {/* Redirige la racine vers le tableau de bord admin */}
        <Route path="/" element={<Navigate to="/admin" replace />} />

        {/* Layout principal de l’admin */}
        <Route path="/admin" element={<Admin />}>
          <Route index element={<Dashboard />} />
          <Route path="reservations" element={<Reservations />} />
          <Route path="clients" element={<Clients />} />
          <Route path="restaurants" element={<Restaurants />} />
          <Route path="horaires" element={<Horaires />} />
          <Route path="fermetures" element={<Fermetures />} />
          <Route path="disponibilites" element={<Disponibilites />} />
        </Route>

        {/* Redirection par défaut vers /admin */}
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
