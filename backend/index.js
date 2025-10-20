// --- Import Required Packages ---
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";
import http from "http";
import { Server } from "socket.io";
import qrcode from "qrcode";
import pkg from "whatsapp-web.js";

dotenv.config(); // Load environment variables

// Extract CommonJS exports from whatsapp-web.js
const { Client, LocalAuth } = pkg;

// --- Setup Directory References ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// --- Initialize Express and Server ---
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

// --- Connect to MongoDB ---
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// --- Initialize WhatsApp Client ---
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
});

// --- WhatsApp Event Listeners ---
client.on("qr", (qr) => {
  console.log("📱 QR Code received. Scan it with your phone!");
  qrcode.toDataURL(qr, (err, url) => {
    if (err) return console.error("QR generation failed:", err);
    io.emit("qr", url); // Send QR to frontend via socket
  });
});

client.on("ready", () => {
  console.log("🤖 WhatsApp Bot is ready to use!");
  io.emit("ready");
});

client.on("authenticated", () => {
  console.log("🔐 WhatsApp Authenticated!");
});

client.on("auth_failure", (msg) => {
  console.error("❌ Authentication Failed:", msg);
});

client.on("disconnected", (reason) => {
  console.log("⚠️ WhatsApp Disconnected:", reason);
  client.initialize(); // Reconnect automatically
});

// --- Initialize the WhatsApp Client ---
client.initialize();

// --- Basic Routes ---
app.get("/", (req, res) => {
  res.send("✅ WhatsApp Admin Bot Backend is Running!");
});

// --- Start Server ---
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
