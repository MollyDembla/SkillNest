const app = require('./app');
const connectDB = require('./config/db');
const config = require('./config/env');
const { startRetrainJob } = require('./jobs/retrainJob');
const logger = require('./utils/logger');

process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION', err);
  process.exit(1);
});

const start = async () => {
  await connectDB();

  app.listen(config.port, () => {
    logger.info(`AI service running on port ${config.port}`);
  });

  startRetrainJob();
};

process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION', err);
  process.exit(1);
});

start();
