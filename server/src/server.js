const http = require('http');
const app = require('./app');
const config = require('./config/env');
const connectDB = require('./config/db');
const { initSocket } = require('./config/socket');
const { initSockets } = require('./sockets');

// Handle uncaught exceptions first
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! Shutting down...');
  console.error(err.name, err.message, err.stack);
  process.exit(1);
});

// Bootstrapping the Server
const startServer = async () => {
  // 1. Establish DB Connection
  await connectDB();

  // 2. Create HTTP Server
  const server = http.createServer(app);

  // 3. Initialize Socket.io
  const io = initSocket(server);

  // 4. Register socket events
  initSockets(io);

  // 5. Make io accessible in request handlers via req.app.get('io')
  app.set('io', io);

  // 6. Start listening
  const PORT = config.port || 5000;
  const runningServer = server.listen(PORT, () => {
    console.log(`Server running in ${config.nodeEnv} mode on port ${PORT}`);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION! Shutting down...');
    console.error(err.name, err.message);
    runningServer.close(() => {
      process.exit(1);
    });
  });
};

startServer();
