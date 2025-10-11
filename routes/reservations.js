import express from "express";
import supabase from "../db.js";
import { v4 as uuidv4 } from "uuid";
import QRCode from "qrcode";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { name, email, date } = req.body;
    const id = uuidv4();
    const qrData = `Réservation #${id} - ${name} - ${date}`;
    const qrCodeBase64 = await QRCode.toDataURL(qrData);

    const { error } = await supabase
      .from("reservations")
      .insert([{ id, name, email, date, qrcode: qrCodeBase64 }]);

    if (error) throw error;
    res.status(201).json({ success: true, qrCode: qrCodeBase64 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  const { data, error } = await supabase.from("reservations").select("*");
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

export default router;
