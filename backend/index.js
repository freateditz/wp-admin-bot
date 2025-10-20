import express from "express";
import cors from "cors";
import qrcode from "qrcode";
import pkg from "whatsapp-web.js";
import { fileURLToPath } from "url";
import { dirname } from "path";

const { Client, LocalAuth } = pkg;

const app = express();
const port = process.env.PORT || 5000;

// --- ✅ FIXED UNIVERSAL CORS HANDLING ---
app.use(
  cors({
    origin: "*", // allow all origins
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// --- Middleware ---
app.use(express.json());

// --- WhatsApp Client Setup ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let qrCodeData = null;
let isReady = false;

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
});

client.on("qr", async (qr) => {
  console.log("📲 QR RECEIVED");
  qrCodeData = await qrcode.toDataURL(qr);
});

client.on("ready", () => {
  console.log("✅ WhatsApp client is ready!");
  isReady = true;
});

client.initialize();

// --- Routes ---

// Generate or get QR
app.get("/generate-qr", async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // extra CORS layer
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
  res.send("✅ WP Admin Bot Backend Running Successfully!");
});

// --- Start Server ---
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
