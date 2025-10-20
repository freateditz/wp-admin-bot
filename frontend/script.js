// Replace this URL with your backend's Render URL
const BACKEND_URL = "https://wp-admin-bot.onrender.com";

const socket = io(BACKEND_URL);

const status = document.getElementById("status");
const qrImg = document.getElementById("qr");
const info = document.getElementById("info");
const reconnectBtn = document.getElementById("reconnect");

// --- Socket Events ---

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

// --- Reconnect Button ---
reconnectBtn.addEventListener("click", () => {
  info.textContent = "🔄 Reconnecting...";
  reconnectBtn.style.display = "none";
  socket.connect();
});
