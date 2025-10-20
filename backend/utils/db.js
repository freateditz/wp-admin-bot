const mongoose = require('mongoose');

async function connect(mongoUrl) {
  if (!mongoUrl) throw new Error('MONGO_URL required');
  mongoose.set('strictQuery', false);
  await mongoose.connect(mongoUrl, {
    // useNewUrlParser, useUnifiedTopology are defaults in modern mongoose
  });
  console.log('Mongo connected');
}

module.exports = { connect };
