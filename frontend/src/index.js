import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

document.documentElement.style.backgroundColor = "#bad5b7";
document.body.style.backgroundColor = "#bad5b7";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);


