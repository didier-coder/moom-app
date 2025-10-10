import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import reservations from "./routes/reservations.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/reservations", reservations);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Backend actif sur le port ${PORT}`));
