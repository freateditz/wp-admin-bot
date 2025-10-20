// ===============================
// 📱 WhatsApp Admin Bot Backend
// ===============================

import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import qrcode from "qrcode";
import dotenv from "dotenv";
import pkg from "whatsapp-web.js";

dotenv.config();

const { Client, LocalAuth } = pkg;

// -------------------------------
// 🔧 Server + Config Setup
// -------------------------------
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 5000;
let client;
let qrRequested = false;

// -------------------------------
// 🧩 Middlewares
// -------------------------------
app.use(cors());
app.use(express.json());

// -------------------------------
// ⚡ Manual QR Code Trigger Route
// -------------------------------
app.get("/generate-qr", async (req, res) => {
  try {
    console.log("🔄 Manual QR generation requested...");

    qrRequested = true;

    // Destroy old client if exists
    if (client) {
      try {
        await client.destroy();
      } catch (err) {
        console.error("⚠️ Error destroying old client:", err);
      }
    }

    // Reinitialize WhatsApp client
    initializeClient();
    res.status(200).send("✅ QR generation started...");
  } catch (err) {
    console.error("❌ Error generating QR:", err);
    res.status(500).send("Error generating QR");
  }
});

// -------------------------------
// ⚙️ WhatsApp Client Initialization
// -------------------------------
function initializeClient() {
  client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    },
  });

  // ✅ QR Event
  client.on("qr", async (qr) => {
    if (!qrRequested) return; // Only send QR when user clicked “Generate QR”
    try {
      const qrImage = await qrcode.toDataURL(qr);
      console.log("📱 QR generated and sent to frontend");
      io.emit("qr", qrImage);
      qrRequested = false;
    } catch (err) {
      console.error("❌ Failed to generate QR:", err);
    }
  });

  // ✅ When WhatsApp is Ready
  client.on("ready", () => {
    console.log("🤖 WhatsApp Bot is Ready!");
    io.emit("ready");
  });

  // ✅ Authenticated
  client.on("authenticated", () => {
    console.log("🔐 WhatsApp Authenticated");
    io.emit("authenticated");
  });

  // ❌ Auth Failure
  client.on("auth_failure", (msg) => {
    console.error("❌ Authentication Failed:", msg);
    io.emit("auth_failure", msg);
  });

  // ⚠️ Disconnected
  client.on("disconnected", (reason) => {
    console.warn("⚠️ WhatsApp Disconnected:", reason);
    io.emit("disconnected", reason);
    setTimeout(initializeClient, 5000); // Reconnect automatically
  });

  // 🧠 Initialize the Client
  client.initialize();
}

// -------------------------------
// 🔌 Socket.io Connection
// -------------------------------
io.on("connection", (socket) => {
  console.log("🟢 Frontend connected to backend via Socket.io");
  socket.emit("status", "Connected to backend socket ✅");

  socket.on("disconnect", () => {
    console.log("🔴 Frontend disconnected");
  });
});

// -------------------------------
// 🌐 Base Route
// -------------------------------
app.get("/", (req, res) => {
  res.send("✅ WhatsApp Admin Bot Backend is Running!");
});

// -------------------------------
// 🚀 Start Server
// -------------------------------
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  initializeClient();
});
