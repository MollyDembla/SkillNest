const config = require('./config/env');
const connectDB = require('./config/db');
const mongoose = require('mongoose');

console.log('--- SYSTEM VERIFICATION TEST STARTING ---');

const testEnv = () => {
  console.log('Testing Config Env...');
  if (!config.mongoUri) throw new Error('MONGO_URI is missing');
  if (!config.jwtSecret) throw new Error('JWT_SECRET is missing');
  console.log('✔ Env verification passed.');
};

const testModels = () => {
  console.log('Testing Mongoose Models compilation...');
  const models = [
    'User',
    'Course',
    'Lesson',
    'Enrollment',
    'Wishlist',
    'Cart',
    'Payment',
    'Order',
    'Review',
    'Progress',
    'ChatRoom',
    'Message',
    'Notification',
    'Certificate',
    'AnalyticsSnapshot'
  ];

  models.forEach((modelName) => {
    const model = require(`./models/${modelName}`);
    if (!model || !mongoose.model(modelName)) {
      throw new Error(`Model ${modelName} failed to register with Mongoose!`);
    }
  });

  console.log('✔ All 15 Mongoose models compiled and registered successfully.');
};

const runTests = async () => {
  try {
    // 1. Env check
    testEnv();

    // 2. Models check
    testModels();

    // 3. Database connection check
    console.log('Attempting MongoDB Atlas connection (using MONGO_URI)...');
    await connectDB();
    console.log('✔ Database connection established successfully.');

    // 4. Server boot check
    console.log('Simulating server boot wiring...');
    const app = require('./app');
    const http = require('http');
    const server = http.createServer(app);
    const { initSocket } = require('./config/socket');
    const io = initSocket(server);
    const { initSockets } = require('./sockets');
    initSockets(io);
    console.log('✔ App, Socket.io, and Sockets successfully bound.');

    console.log('\n=======================================');
    console.log('★ ALL BACKEND FOUNDATION TESTS PASSED! ★');
    console.log('=======================================');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ VERIFICATION TEST FAILED:');
    console.error(error);
    process.exit(1);
  }
};

runTests();
