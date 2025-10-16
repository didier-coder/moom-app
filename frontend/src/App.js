import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Reservation from "./Reservation";
import Admin from "./Admin";

function App() {
  return (
    <Router>
      <div
        style={{
          fontFamily: "system-ui, sans-serif",
          backgroundColor: "#f8f9fa",
          minHeight: "100vh",
        }}
      >
        <AnimatePresence mode="wait">
          {/* ✅ Routes React */}
          <Routes>
            <Route
              path="/"
              element={
                <motion.div
                  key="reservation"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.4 }}
                >
                  <Reservation />
                </motion.div>
              }
            />
            <Route
              path="/admin"
              element={
                <motion.div
                  key="admin"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.4 }}
                >
                  <Admin />
                </motion.div>
              }
            />
          </Routes>
        </AnimatePresence>
      </div>
    </Router>
  );
}

export default App;


  );
}

export default App;
