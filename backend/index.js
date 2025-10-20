import express from "express";
import cors from "cors";
import qrcode from "qrcode";
import mongoose from "mongoose";
import { Client, LocalAuth } from "whatsapp-web.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

// ✅ CORS setup
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || "http://localhost:5500",
    "https://wp-admin-bot-frontend.onrender.com"
  ],
  credentials: true,
}));

// ✅ MongoDB connection
if (process.env.MONGO_URL) {
  mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log("✅ MongoDB connected"))
    .catch(err => console.error("❌ MongoDB error:", err));
}

let qrCodeData = null;
let isClientReady = false;

// ✅ WhatsApp client setup
const client = new Client({
  authStrategy: new LocalAuth({ clientId: "AdminBotSession" }),
  puppeteer: { headless: true, args: ["--no-sandbox"] },
});

client.on("qr", async qr => {
  qrCodeData = await qrcode.toDataURL(qr);
  isClientReady = false;
  console.log("⚡ QR generated");
});

client.on("ready", () => {
  isClientReady = true;
  qrCodeData = null;
  console.log("✅ WhatsApp client is ready!");
});

client.on("disconnected", reason => {
  console.log("⚠️ Disconnected:", reason);
  isClientReady = false;
  qrCodeData = null;
  client.initialize();
});

client.initialize();

// ✅ API Routes

// 1️⃣ Generate QR manually
app.get("/generate-qr", (req, res) => {
  if (isClientReady) {
    return res.status(200).json({ message: "WhatsApp Client is already connected!" });
  }
  if (!qrCodeData) {
    return res.status(404).json({ message: "QR not generated yet. Wait for a few seconds and retry." });
  }
  res.status(200).json({ qr: qrCodeData });
});

// 2️⃣ Logout endpoint
app.get("/logout", async (req, res) => {
  try {
    await client.logout();
    isClientReady = false;
    qrCodeData = null;
    res.status(200).json({ message: "✅ Logged out successfully." });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "❌ Logout failed." });
  }
});

// 3️⃣ Default route
app.get("/", (req, res) => {
  res.send("✅ Backend is running & connected to WhatsApp bot");
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
