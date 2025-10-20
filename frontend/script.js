// ✅ Backend URL (your Node.js + Socket.IO server)
const backendURL = "http://localhost:3000";

// ✅ Connect to backend socket
const socket = io(backendURL);

// ✅ Get QR div
const qrDiv = document.getElementById("qr");

// ✅ When connected to backend
socket.on("connect", () => {
  console.log("✅ Connected to backend socket");
});

// ✅ When backend sends QR code
socket.on("qr", (qrImage) => {
  qrDiv.innerHTML = `<img src="${qrImage}" alt="QR Code" />`;
});

// ✅ When disconnected
socket.on("disconnect", () => {
  console.log("❌ Disconnected from backend");
  qrDiv.innerHTML = `<p>⚠️ Lost connection to backend.</p>`;
});

// ✅ When WhatsApp is ready
socket.on("ready", () => {
  qrDiv.innerHTML = `<p>✅ WhatsApp Bot is ready!</p>`;
});
