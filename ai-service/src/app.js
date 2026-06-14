const express = require('express');
const cors = require('cors');
const config = require('./config/env');
const recommendationRoutes = require('./routes/recommendationRoutes');
const progressRoutes = require('./routes/progressRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// API key guard — all requests must supply the shared key
app.use((req, res, next) => {
  const key = req.headers['x-api-key'];
  if (key !== config.apiKey) {
    return res.status(401).json({ success: false, message: 'Unauthorized.' });
  }
  next();
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'ai-service', timestamp: new Date() });
});

app.use('/recommendations', recommendationRoutes);
app.use('/progress', progressRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

module.exports = app;
