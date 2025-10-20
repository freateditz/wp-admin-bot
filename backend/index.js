// --- Imports ---
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";
import http from "http";
import { Server } from "socket.io";
import qrcode from "qrcode";
import pkg from "whatsapp-web.js";

dotenv.config();
const { Client, LocalAuth } = pkg;

// --- Setup directory refs ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// --- Initialize Express & Socket.io ---
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // allow all for Render
    methods: ["GET", "POST"],
  },
});

// --- MongoDB connection (optional) ---
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("⚠️ MongoDB not connected:", err.message));

// --- WhatsApp Client ---
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
});

// --- WhatsApp Events ---
client.on("qr", (qr) => {
  console.log("📱 QR Code generated, emitting to frontend...");
  qrcode.toDataURL(qr, (err, url) => {
    if (err) return console.error("QR Error:", err);
    io.emit("qr", url);
  });
});

client.on("ready", () => {
  console.log("🤖 WhatsApp Bot is ready!");
  io.emit("ready");
});

client.on("authenticated", () => {
  console.log("🔐 Authenticated!");
  io.emit("authenticated");
});

client.on("auth_failure", (msg) => console.error("❌ Auth failed:", msg));

client.on("disconnected", (reason) => {
  console.log("⚠️ Disconnected:", reason);
  client.initialize();
});

// --- Initialize WhatsApp ---
client.initialize();

// --- Express route ---
app.get("/", (req, res) => {
  res.send("✅ Backend is running & connected to WhatsApp bot");
});

// --- Socket connection log ---
io.on("connection", (socket) => {
  console.log("🟢 Frontend connected via Socket.io");
  socket.emit("connected", "Backend socket online ✅");
});

// --- Start server ---
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
