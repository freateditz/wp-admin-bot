// ✅ Connect to your deployed backend on Render
const socket = io("https://wp-admin-bot.onrender.com", {
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: 10,
});

const statusDiv = document.getElementById("status");
const qrImg = document.getElementById("qr-image");

// Connected to backend
socket.on("connect", () => {
  statusDiv.textContent = "Connected to backend ✅";
});

// When QR code received
socket.on("qr", (qrUrl) => {
  statusDiv.textContent = "Scan the QR below 👇";
  qrImg.src = qrUrl;
  qrImg.style.display = "block";
});

// When bot is ready
socket.on("ready", () => {
  statusDiv.textContent = "✅ WhatsApp Bot is Ready!";
  qrImg.style.display = "none";
});

// If backend disconnects
socket.on("disconnect", () => {
  statusDiv.textContent = "❌ Disconnected from backend.";
  qrImg.style.display = "none";
});

// Handle connection errors
socket.on("connect_error", (err) => {
  statusDiv.textContent = "⚠️ Unable to connect to backend.";
  console.error("Socket connection error:", err);
});
