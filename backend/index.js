import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { Client, LocalAuth } from "whatsapp-web.js";
import qrcode from "qrcode";
import { Server } from "socket.io";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";

// For ES modules (fix __dirname issue)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// WhatsApp Client Setup
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: { headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] },
});

client.on("qr", (qr) => {
  console.log("📱 QR RECEIVED");
  qrcode.toDataURL(qr, (err, url) => {
    io.emit("qr", url);
  });
});

client.on("ready", () => {
  console.log("🤖 WhatsApp Bot is Ready!");
  io.emit("ready", "WhatsApp bot is ready!");
});

client.on("message", async (message) => {
  console.log(`📩 Message from ${message.from}: ${message.body}`);
  if (message.body.toLowerCase() === "hi") {
    await message.reply("Hello! I'm your WP Admin Bot 🤖");
  }
});

client.initialize();

app.get("/", (req, res) => {
  res.send("✅ WP Admin Bot backend is running!");
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
