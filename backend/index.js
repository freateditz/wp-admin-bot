// index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import qrcode from "qrcode";
import pkg from "whatsapp-web.js";
const { Client, LocalAuth } = pkg;

dotenv.config();

const app = express();
app.use(express.json());

// ✅ Allow requests only from your frontend
const FRONTEND_ORIGIN = process.env.FRONTEND_URL || "https://wp-admin-bot-frontend.onrender.com";
app.use(cors({ origin: FRONTEND_ORIGIN, credentials: true }));

// ✅ MongoDB Connection
const mongoUri = process.env.MONGO_URI;
mongoose
  .connect(mongoUri)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection failed:", err));

// ✅ WhatsApp Client Setup
let qrCodeData = null;
let isClientReady = false;

const client = new Client({
  authStrategy: new LocalAuth({ clientId: process.env.BOT_PROFILE_NAME || "AdminBot" }),
  puppeteer: {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  },
});

client.on("qr", async (qr) => {
  console.log("📱 QR RECEIVED");
  qrCodeData = await qrcode.toDataURL(qr);
});

client.on("ready", () => {
  console.log("🤖 WhatsApp bot is ready!");
  isClientReady = true;
  qrCodeData = null;
});

client.on("disconnected", () => {
  console.log("❌ WhatsApp disconnected");
  isClientReady = false;
});

client.initialize();

// ✅ Root route
app.get("/", (req, res) => {
  res.send("Backend Running ✅");
});

// ✅ Route to manually generate QR
app.get("/generate-qr", (req, res) => {
  if (isClientReady) {
    return res.json({ message: "WhatsApp Client is already connected!" });
  }
  if (!qrCodeData) {
    return res.status(400).json({ message: "QR not generated yet. Please wait..." });
  }
  res.json({ qr: qrCodeData });
});

// ✅ Logout route
app.post("/logout", async (req, res) => {
  try {
    await client.logout();
    console.log("🧹 Client logged out successfully");
    isClientReady = false;
    qrCodeData = null;
    res.json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ error: "Logout failed" });
  }
});

// ✅ Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
