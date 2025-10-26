import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "./components/Sidebar";

export default function Admin() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#f7f7f7]">
      {/* 🌿 Sidebar animée */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* 🌿 Contenu principal */}
      <main className="flex-1 flex flex-col transition-all duration-300">
        {/* 🧭 En-tête supérieur */}
        <header className="flex items-center justify-between border-b bg-white px-6 py-4 shadow-sm">
          <h1 className="text-xl font-semibold text-[#1a1a1a]">MOOM Admin</h1>

          <div className="flex items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#bad5b7] flex items-center justify-center text-[#1a1a1a] font-bold">
                D
              </div>
              <span>Didier</span>
              <button
                className="text-[#a8c9a3] hover:underline"
                onClick={() => alert('Déconnexion (à venir)')}
              >
                Déconnexion
              </button>
            </div>
          </div>
        </header>

        {/* 🌿 Contenu dynamique (sous-pages Admin) */}
        <div className="p-6 flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={window.location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
