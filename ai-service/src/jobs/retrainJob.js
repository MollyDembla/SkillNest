const mongoose = require('mongoose');
const logger = require('../utils/logger');

const getCollection = (name) => mongoose.connection.collection(name);

/**
 * Periodic job to analyze recommendation logs and report accuracy signals.
 * In a production ML system, this would retrain the model.
 * Here it logs: how often recommended courses were enrolled in within 7 days.
 */
const runRetrainAnalysis = async () => {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const recentLogs = await getCollection('recommendationlogs')
      .find({ createdAt: { $gte: sevenDaysAgo } })
      .toArray();

    if (recentLogs.length === 0) {
      logger.info('Retrain job: no recent recommendation logs to analyze.');
      return;
    }

    let totalRecommendations = 0;
    let totalConversions = 0;

    for (const log of recentLogs) {
      const recommended = log.recommendedCourses || [];
      totalRecommendations += recommended.length;

      const conversions = await getCollection('enrollments')
        .countDocuments({
          student: log.student,
          course: { $in: recommended },
          createdAt: { $gte: new Date(log.createdAt) },
        });
      totalConversions += conversions;
    }

    const ctr = totalRecommendations > 0
      ? ((totalConversions / totalRecommendations) * 100).toFixed(2)
      : 0;

    logger.info(`Retrain analysis: ${recentLogs.length} sessions, ${totalConversions}/${totalRecommendations} conversions (${ctr}% CTR)`);
  } catch (err) {
    logger.error('Retrain job failed', err);
  }
};

// Run every 24h when called
const startRetrainJob = () => {
  logger.info('Retrain job scheduled (every 24h)');
  setInterval(runRetrainAnalysis, 24 * 60 * 60 * 1000);
  runRetrainAnalysis(); // run once on startup
};

module.exports = { startRetrainJob };
