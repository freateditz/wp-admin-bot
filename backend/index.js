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

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = http.createServer(app);

// ✅ Allow frontend on Render
const io = new Server(server, {
  cors: {
    origin: "https://wp-admin-bot-frontend.onrender.com", // your frontend
    methods: ["GET", "POST"],
  },
});

// ✅ MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

// ✅ Initialize WhatsApp client
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
});

// ✅ WhatsApp Events
client.on("qr", (qr) => {
  console.log("📱 QR Received");
  qrcode.toDataURL(qr, (err, url) => {
    if (err) {
      console.error("QR Error:", err);
      return;
    }
    io.emit("qr", url);
  });
});

client.on("ready", () => {
  console.log("🤖 WhatsApp Bot Ready!");
  io.emit("ready");
});

client.on("authenticated", () => {
  console.log("🔐 Authenticated");
  io.emit("authenticated");
});

client.on("auth_failure", (msg) => {
  console.error("❌ Auth Failure:", msg);
  io.emit("auth_failure", msg);
});

client.on("disconnected", (reason) => {
  console.log("⚠️ Disconnected:", reason);
  io.emit("disconnected", reason);
  client.initialize();
});

client.initialize();

// ✅ Route
app.get("/", (req, res) => {
  res.send("✅ WhatsApp Admin Bot Backend Running!");
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
