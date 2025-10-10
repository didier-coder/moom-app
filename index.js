import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import reservations from './routes/reservations.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Route d'accueil
app.get('/', (req, res) => {
  res.send(`
    <h1>🚀 API MOOM – Backend opérationnel ✅</h1>
    <p>Bienvenue sur l'API de moom.be</p>
    <ul>
      <li><a href="/api/reservations">Voir les réservations</a></li>
    </ul>
  `);
});

app.use('/api/reservations', reservations);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Backend actif sur le port ${PORT}`));


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Backend actif sur le port ${PORT}`));

app.get('/', (req, res) => {
  res.send('🚀 API MOOM – Backend opérationnel ✅');
});
