// Connect to your deployed backend
const socket = io("https://wp-admin-bot.onrender.com", {
  transports: ["websocket"],
});

const statusEl = document.getElementById("status");
const qrContainer = document.getElementById("qr-container");
const qrImg = document.getElementById("qr");
const connectedMsg = document.getElementById("connected");

// When connected to backend
socket.on("connect", () => {
  statusEl.textContent = "Connected to backend ✅";
  statusEl.style.color = "#00ff99";
  console.log("✅ Connected to backend socket");
});

// When backend disconnects
socket.on("disconnect", () => {
  statusEl.textContent = "Disconnected ❌";
  statusEl.style.color = "#ff3333";
  qrContainer.classList.add("hidden");
  connectedMsg.classList.add("hidden");
  console.log("❌ Disconnected from backend");
});

// Receive QR from backend
socket.on("qr", (qrData) => {
  console.log("📱 QR received");
  qrContainer.classList.remove("hidden");
  connectedMsg.classList.add("hidden");
  qrImg.src = qrData;
  qrImg.alt = "WhatsApp QR Code";
});

// When bot is ready
socket.on("ready", () => {
  qrContainer.classList.add("hidden");
  connectedMsg.classList.remove("hidden");
  console.log("🤖 Bot is ready!");
});

// When session is authenticated
socket.on("authenticated", () => {
  statusEl.textContent = "Authenticated ✅";
  statusEl.style.color = "#00ff99";
  qrContainer.classList.add("hidden");
  connectedMsg.classList.remove("hidden");
  console.log("🔐 Authenticated!");
});
