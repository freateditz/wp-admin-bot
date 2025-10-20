// ==================== Imports ====================
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const qrcode = require('qrcode');
const dotenv = require('dotenv');
const { Client, LocalAuth } = require('whatsapp-web.js');

// Load env
dotenv.config();

// ==================== Config ====================
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

// ==================== Middleware ====================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==================== MongoDB Connection ====================
mongoose
  .connect(MONGO_URI)
  .then(() => console.log('✅ Mongo connected'))
  .catch(err => console.error('❌ Mongo error:', err));

// ==================== WhatsApp Client ====================
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: { headless: true }
});

// ==================== Socket.IO Events ====================
io.on('connection', socket => {
  console.log('🔌 Socket connected:', socket.id);
});

// ==================== WhatsApp Event Handlers ====================
client.on('qr', async qr => {
  const qrImage = await qrcode.toDataURL(qr);
  io.emit('qr', qrImage);
  console.log('📱 QR generated — scan it on your bot phone');
});

client.on('authenticated', () => {
  console.log('✅ Authenticated with WhatsApp Web');
});

client.on('ready', () => {
  console.log('🤖 Client is ready!');
});

// ==================== Message Handler ====================
client.on('message_create', async msg => {
  try {
    const chat = await msg.getChat();
    if (msg.fromMe) return; // ignore self

    // TAG ALL feature
    if (msg.body.toLowerCase().includes('tagall!')) {
      if (chat.isGroup) {
        const participants = chat.participants.map(p => p.id._serialized);
        const mentions = [];
        let text = '📢 *Tagging all members:*\n\n';

        for (const id of participants) {
          const contact = await client.getContactById(id);
          mentions.push(contact);
          text += `@${contact.number} `;
        }

        await chat.sendMessage(text, { mentions });
        console.log('✅ Everyone tagged');
      } else {
        await msg.reply('❌ This command only works in groups.');
      }
    }

    // KICK OUT feature
    if (msg.body.toLowerCase().includes('kickout!')) {
      if (chat.isGroup && msg.mentionedIds.length > 0) {
        for (const userId of msg.mentionedIds) {
          try {
            await chat.removeParticipants([userId]);
            console.log(`🚫 Removed: ${userId}`);
          } catch (err) {
            console.error('⚠️ Failed to remove:', userId, err);
          }
        }
      } else {
        await msg.reply('❌ Please tag someone to kick out.');
      }
    }

    // Ping test
    if (msg.body.toLowerCase() === '!ping') {
      await msg.reply('🏓 Pong!');
    }
  } catch (err) {
    console.error('💥 Error in message handler:', err);
  }
});

// ==================== Initialize Client ====================
client.initialize();

// ==================== Express Routes ====================
app.get('/', (req, res) => {
  res.send('✅ WhatsApp Bot Backend Running');
});

// ==================== Start Server ====================
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
