require('dotenv').config();

module.exports = {
  port: process.env.PORT || 8001,
  mongoUri: process.env.MONGO_URI,
  apiKey: process.env.API_KEY || 'skillnest_ai_key',
  nodeEnv: process.env.NODE_ENV || 'development',
};
