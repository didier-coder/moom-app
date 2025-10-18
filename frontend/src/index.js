import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// ✅ Supprimé l'appel à reportWebVitals() pour éviter l'erreur de build sur Vercel
// Si tu veux réactiver les métriques, tu pourras réimporter le fichier plus tard.

