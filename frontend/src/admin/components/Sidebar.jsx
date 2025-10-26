import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaCalendarAlt,
  FaFileInvoice,
  FaUsers,
  FaUtensils,
  FaClock,
  FaDoorClosed,
  FaCheckCircle,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

export default function Sidebar({ collapsed, setCollapsed }) {
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  // 📱 Détection mobile
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const menuItems = [
    { name: "Dashboard", icon: <FaHome />, link: "/admin" },
    { name: "Calendrier", icon: <FaCalendarAlt />, link: "/admin/calendrier" },
    { name: "Réservations", icon: <FaFileInvoice />, link: "/admin/reservations" },
    { name: "Clients", icon: <FaUsers />, link: "/admin/clients" },
    { name: "Restaurants", icon: <FaUtensils />, link: "/admin/restaurants" },
    { name: "Horaires", icon: <FaClock />, link: "/admin/horaires" },
    { name: "Fermetures", icon: <FaDoorClosed />, link: "/admin/fermetures" },
    { name: "Disponibilités", icon: <FaCheckCircle />, link: "/admin/disponibilites" },
  ];

  return (
    <>
      {/* 🟢 Overlay mobile */}
      <AnimatePresence>
        {mobileMenuOpen && isMobile && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* 🌿 Sidebar principale */}
      <motion.aside
        animate={{
          width: isMobile ? 260 : collapsed ? 80 : 260,
          x: isMobile && !mobileMenuOpen ? -260 : 0,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed lg:static h-screen bg-[#1a1a1a] text-[#bbbbbb] flex flex-col z-50 shadow-lg"
      >
        {/* 🌿 Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-[#333]">
          {!collapsed && <h1 className="text-lg font-semibold text-[#a8c9a3]">MOOM Admin</h1>}
          <button
            onClick={() => setCollapsed((prev) => !prev)}
            className="text-[#bbbbbb] hover:text-[#a8c9a3] focus:outline-none transition-transform"
          >
            {collapsed ? (
              <FaChevronRight className="text-lg" />
            ) : (
              <FaChevronLeft className="text-lg" />
            )}
          </button>
        </div>

        {/* 🌿 Menu principal */}
        <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
  {menuItems.map((item, i) => {
    const isActive = location.pathname === item.link;

    return (
      <motion.button
        key={i}
        whileHover={{ scale: 1.02 }}
        onClick={() => navigate(item.link)}
        className={`group relative w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
          isActive
            ? "bg-[#bad5b7] text-[#1a1a1a] font-semibold shadow-sm"
            : "hover:bg-[#2a2a2a] text-[#bbbbbb]"
        }`}
      >
        {/* 🌿 Barre verte d’accent */}
        {isActive && (
          <motion.span
            layoutId="activeIndicator"
            className="absolute left-0 top-[6px] h-[calc(100%-12px)] w-[4px] bg-[#a8c9a3] rounded-r-lg shadow-[0_0_8px_2px_rgba(186,213,183,0.6)]"
          />
        )}

        {/* 🌿 Icône avec animation */}
        <motion.span
  key={isActive ? `${item.name}-active` : `${item.name}-inactive`}
  initial={{ scale: 0.9, opacity: 0.8 }}
  animate={
    isActive
      ? { scale: 1.25, opacity: 1, filter: "drop-shadow(0 0 6px #a8c9a3)" }
      : { scale: 1, opacity: 0.85, filter: "drop-shadow(0 0 0px transparent)" }
  }
  transition={{
    type: "spring",
    stiffness: 400,
    damping: 18,
    mass: 0.5,
  }}
  className="text-xl relative z-10"
>
  {item.icon}
</motion.span>

        {/* 🌿 Nom du bouton */}
        {!collapsed && (
          <span className="text-sm relative z-10">{item.name}</span>
        )}
      </motion.button>
    );
  })}
</nav>


        {/* 🌿 Footer */}
        <div className="p-3 text-xs text-[#555] border-t border-[#333] text-center">
          {!collapsed ? `MOOM © ${new Date().getFullYear()}` : "©"}
        </div>
      </motion.aside>
    </>
  );
}
