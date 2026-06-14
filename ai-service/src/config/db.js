const mongoose = require('mongoose');
const config = require('./env');

const connectDB = async () => {
  const conn = await mongoose.connect(config.mongoUri);
  console.log(`[AI] MongoDB connected: ${conn.connection.host}`);
};

module.exports = connectDB;
