document.addEventListener("DOMContentLoaded", () => {
  const qrContainer = document.getElementById("qrContainer");
  const qrImage = document.getElementById("qrImage");
  const generateBtn = document.getElementById("generateBtn");
  const statusText = document.getElementById("status");

  async function fetchQR() {
    statusText.textContent = "⏳ Fetching QR...";
    try {
      const res = await fetch("https://wp-admin-bot.onrender.com/generate-qr");
      const data = await res.json();

      if (data.qr) {
        qrImage.src = data.qr;
        qrImage.style.display = "block";
        statusText.textContent = "📱 Scan this QR using WhatsApp";
      } else if (data.status === "ready") {
        statusText.textContent = "✅ WhatsApp Client is already connected!";
        qrImage.style.display = "none";
      } else {
        statusText.textContent = "⚙️ Waiting for QR generation...";
      }
    } catch (error) {
      statusText.textContent = "❌ Unable to connect to backend.";
      console.error(error);
    }
  }

  generateBtn.addEventListener("click", fetchQR);
});
