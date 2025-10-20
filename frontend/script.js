const backendUrl = "https://wp-admin-bot.onrender.com";
const statusEl = document.getElementById("status");
const qrImg = document.getElementById("qr");
const generateBtn = document.getElementById("generateBtn");
const logoutBtn = document.getElementById("logoutBtn");

async function checkStatus() {
  try {
    const res = await fetch(`${backendUrl}/`);
    const data = await res.json();

    if (data.message.includes("connected")) {
      statusEl.innerHTML = "✅ WhatsApp Client is already connected!";
      qrImg.style.display = "none";
    } else {
      statusEl.innerHTML = "📱 Bot not connected. Click 'Generate QR Code' below.";
    }
  } catch (err) {
    statusEl.innerHTML = "❌ Unable to reach backend.";
  }
}

generateBtn.addEventListener("click", async () => {
  try {
    statusEl.innerHTML = "⏳ Generating QR...";
    const res = await fetch(`${backendUrl}/generate-qr`);
    const data = await res.json();

    if (data.success && data.qr) {
      qrImg.src = data.qr;
      qrImg.style.display = "block";
      statusEl.innerHTML = "📱 Scan this QR with WhatsApp to connect.";
    } else {
      statusEl.innerHTML = data.message || "⚠️ QR not ready, try again.";
      qrImg.style.display = "none";
    }
  } catch (err) {
    statusEl.innerHTML = "❌ Error generating QR.";
  }
});

logoutBtn.addEventListener("click", async () => {
  try {
    const res = await fetch(`${backendUrl}/logout`);
    const data = await res.json();
    statusEl.innerHTML = data.message || "Logged out.";
    qrImg.style.display = "none";
  } catch (err) {
    statusEl.innerHTML = "❌ Error logging out.";
  }
});

checkStatus();
