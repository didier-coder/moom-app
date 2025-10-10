import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import reservations from './routes/reservations.js';

dotenv.config();

const app = express();
app.use(cors());

// ✅ Ajoute ceci avant app.use(express.json())
app.use(express.text({ type: '*/*' }));
app.use((req, res, next) => {
  try {
    if (typeof req.body === 'string' && req.body.trim().startsWith('{')) {
      req.body = JSON.parse(req.body);
    }
  } catch {
    // si ce n’est pas du JSON, on laisse comme tel
  }
  next();
});

// ✅ puis garde ton JSON parser habituel
app.use(express.json());

app.get('/', (req, res) => {
  res.send(`<h1>🚀 API MOOM – Backend opérationnel ✅</h1>`);
});

app.use('/api/reservations', reservations);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Backend actif sur le port ${PORT}`));

