import express from "express";
import cors from "cors";
import qrcode from "qrcode";
import pkg from "whatsapp-web.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const { Client, LocalAuth } = pkg;

const app = express();
const port = process.env.PORT || 5000;

// --- FIXED CORS CONFIG ---
app.use(
  cors({
    origin: [
      "https://wp-admin-bot-frontend.onrender.com", // your frontend URL
      "http://localhost:5500", // optional for local testing
    ],
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.use(express.json());

// --- Static path ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// --- Initialize WhatsApp client ---
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: { headless: true, args: ["--no-sandbox"] },
});

let qrCodeData = null;
let isReady = false;

client.on("qr", async (qr) => {
  console.log("QR RECEIVED");
  qrCodeData = await qrcode.toDataURL(qr);
});

client.on("ready", () => {
  console.log("WhatsApp client is ready!");
  isReady = true;
});

client.initialize();

// --- Routes ---

// Manual QR generate endpoint
app.get("/generate-qr", async (req, res) => {
  if (isReady) {
    return res.json({ status: "ready" });
  } else if (qrCodeData) {
    return res.json({ qr: qrCodeData });
  } else {
    return res.json({ status: "waiting-for-qr" });
  }
});

// Test route
app.get("/", (req, res) => {
  res.send("✅ WhatsApp Admin Bot Backend is Running");
});

// --- Start server ---
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
