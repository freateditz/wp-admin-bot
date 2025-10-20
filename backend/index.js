import express from "express";
import { Client, LocalAuth } from "whatsapp-web.js";
import qrcode from "qrcode";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || "https://wp-admin-bot-frontend.onrender.com",
  methods: ["GET", "POST"],
  credentials: true
}));

// MongoDB Connection
const mongoUrl = process.env.MONGO_URI;
mongoose.connect(mongoUrl)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// WhatsApp Client
let client;
let isClientReady = false;
let qrCodeData = "";

const startBot = () => {
  client = new Client({
    authStrategy: new LocalAuth({
      dataPath: "./session_data"
    }),
    puppeteer: {
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    },
  });

  client.on("qr", async (qr) => {
    console.log("📱 QR RECEIVED");
    qrCodeData = await qrcode.toDataURL(qr);
  });

  client.on("ready", () => {
    console.log("🤖 WhatsApp bot is ready!");
    isClientReady = true;
  });

  client.on("disconnected", () => {
    console.log("❌ WhatsApp client disconnected");
    isClientReady = false;
  });

  client.initialize();
};

startBot();

// ---------- ROUTES ----------

// Status route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: isClientReady
      ? "WhatsApp Client is already connected!"
      : "QR not generated yet or not connected."
  });
});

// Generate QR manually
app.get("/generate-qr", async (req, res) => {
  try {
    if (isClientReady) {
      return res.json({
        success: true,
        message: "WhatsApp Client is already connected!",
      });
    }

    if (!qrCodeData) {
      return res.json({
        success: false,
        message: "QR not available yet. Please wait a few seconds and retry.",
      });
    }

    res.json({
      success: true,
      qr: qrCodeData,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Logout route
app.get("/logout", async (req, res) => {
  try {
    if (client) {
      await client.logout();
      isClientReady = false;
      qrCodeData = "";
      console.log("✅ Logged out from WhatsApp");
      res.json({
        success: true,
        message: "Logged out from WhatsApp. Restart backend or click Generate QR again.",
      });
    } else {
      res.json({ success: false, message: "Client not initialized." });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
