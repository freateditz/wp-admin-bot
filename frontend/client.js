// 👉 Change this to your backend URL
const BACKEND_URL = "http://localhost:3000";

const socket = io(BACKEND_URL);

const statusDiv = document.getElementById("status");
const qrImg = document.getElementById("qr-image");

socket.on("connect", () => {
  console.log("🟢 Connected to backend");
  statusDiv.innerText = "Connected to backend...";
});

socket.on("qr", (data) => {
  console.log("📱 QR Received");
  qrImg.src = data.svg;
  statusDiv.innerText = "Scan this QR with WhatsApp on your bot phone!";
});

socket.on("auth", (data) => {
  statusDiv.innerText = "✅ Authenticated with WhatsApp!";
  qrImg.src = "";
});

socket.on("ready", (data) => {
  statusDiv.innerText = `🤖 ${data.botName || "AdminBot"} is ready!`;
  qrImg.src = "";
});

socket.on("auth_failure", (msg) => {
  statusDiv.innerText = "❌ Auth failure: " + msg;
});

socket.on("disconnected", (reason) => {
  statusDiv.innerText = "⚠️ Disconnected: " + reason;
});
