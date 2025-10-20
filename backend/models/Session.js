const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true }, // e.g. "wa-session"
  data: { type: mongoose.Schema.Types.Mixed }, // store session JSON
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

SessionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Session', SessionSchema, process.env.SESSION_COLLECTION || 'Wpbot');
