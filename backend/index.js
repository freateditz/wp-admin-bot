// index.js

import express from "express";
import cors from "cors";
import qrcode from "qrcode";
import pkg from "whatsapp-web.js"; // Import CommonJS package in ESM
const { Client, LocalAuth } = pkg;
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// ====================================
// 🔗 MongoDB (optional)
// ====================================
const mongoURI = process.env.MONGO_URI;
if (mongoURI) {
  mongoose
    .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ MongoDB connected"))
    .catch((err) => console.error("❌ MongoDB connection error:", err));
}

// ====================================
// ⚙️ WhatsApp Client Setup
// ====================================
let qrCodeData = null;
let isClientReady = false;

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
});

client.on("qr", async (qr) => {
  console.log("📱 QR Received");
  qrCodeData = await qrcode.toDataURL(qr);
});

client.on("ready", () => {
  console.log("✅ WhatsApp Client is ready!");
  isClientReady = true;
  qrCodeData = null; // clear QR once connected
});

client.on("disconnected", () => {
  console.log("❌ WhatsApp Client disconnected!");
  isClientReady = false;
});

client.initialize();

// ====================================
// 🛠️ Routes
// ====================================

// Root check
app.get("/", (req, res) => {
  res.send("🟢 WhatsApp Bot Backend is running successfully!");
});

// Generate QR manually
app.get("/generate-qr", async (req, res) => {
  if (isClientReady) {
    return res.json({ status: "connected", message: "Client already connected!" });
  }

  if (!qrCodeData) {
    return res.json({ status: "pending", message: "QR not yet generated. Wait a few seconds and retry." });
  }

  res.json({ status: "qr", qr: qrCodeData });
});

// Check status
app.get("/status", (req, res) => {
  res.json({ connected: isClientReady });
});

// Logout (destroy session)
app.get("/logout", async (req, res) => {
  try {
    await client.logout();
    isClientReady = false;
    qrCodeData = null;
    res.json({ status: "success", message: "Logged out successfully!" });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ status: "error", message: "Failed to logout" });
  }
});

// ====================================
// 🚀 Start Server
// ====================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
