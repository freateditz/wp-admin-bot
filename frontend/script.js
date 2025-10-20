// Backend URL
const BACKEND_URL = "https://wp-admin-bot.onrender.com";

const socket = io(BACKEND_URL);
const status = document.getElementById("status");
const qrImg = document.getElementById("qr");
const info = document.getElementById("info");
const reconnectBtn = document.getElementById("reconnect");
const generateBtn = document.getElementById("generate");

// ===== Socket Events =====

socket.on("connect", () => {
  console.log("✅ Connected to backend socket");
  status.textContent = "Connected to backend ✅";
  reconnectBtn.style.display = "none";
});

socket.on("disconnect", () => {
  console.warn("⚠️ Disconnected from backend");
  status.textContent = "Disconnected ❌";
  info.textContent = "Try reconnecting...";
  reconnectBtn.style.display = "inline-block";
});

socket.on("qr", (qrCode) => {
  console.log("📱 QR Received");
  qrImg.src = qrCode;
  info.textContent = "Scan this QR with WhatsApp to log in!";
  status.textContent = "QR Code Generated ✅";
});

socket.on("ready", () => {
  qrImg.src = "";
  info.textContent = "✅ WhatsApp Bot is Ready!";
  status.textContent = "Bot Ready 🟢";
});

socket.on("authenticated", () => {
  info.textContent = "🔐 WhatsApp Authenticated!";
  status.textContent = "Authenticated ✅";
});

socket.on("auth_failure", (msg) => {
  info.textContent = "❌ Authentication Failed: " + msg;
  status.textContent = "Auth Error ⚠️";
});

socket.on("disconnected", (reason) => {
  info.textContent = "⚠️ WhatsApp Disconnected: " + reason;
  status.textContent = "Disconnected ⚠️";
  reconnectBtn.style.display = "inline-block";
});

// ===== Button Handlers =====

// Manual QR Code Generator
generateBtn.addEventListener("click", async () => {
  try {
    info.textContent = "⏳ Requesting new QR Code...";
    qrImg.src = "";
    const res = await fetch(`${BACKEND_URL}/generate-qr`);
    if (res.ok) {
      info.textContent = "Waiting for QR code from backend...";
      console.log("🟢 Backend acknowledged QR generation request.");
    } else {
      info.textContent = "❌ Failed to request QR generation.";
    }
  } catch (err) {
    info.textContent = "❌ Error contacting backend.";
    console.error(err);
  }
});

// Reconnect manually to socket
reconnectBtn.addEventListener("click", () => {
  info.textContent = "🔄 Reconnecting...";
  reconnectBtn.style.display = "none";
  socket.connect();
});
