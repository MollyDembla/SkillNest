const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

const requiredEnvVars = [
  'MONGO_URI',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET'
];

// Check critical environment variables
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`CRITICAL CONFIG ERROR: Environment variable "${envVar}" is missing from .env!`);
  }
}

// Warn about missing APIs in development, but don't hard crash unless in production
const apiEnvVars = [
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET'
];

for (const envVar of apiEnvVars) {
  if (!process.env[envVar] || process.env[envVar].includes('your_') || process.env[envVar].includes('here')) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`CRITICAL CONFIG ERROR: Stripe/Cloudinary configuration "${envVar}" is invalid or placeholder in production!`);
    } else {
      console.warn(`WARNING: Environment variable "${envVar}" is not set or contains placeholder values. Some features might not work properly.`);
    }
  }
}

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  clientUrl: process.env.CLIENT_URL || process.env.FRONTEND_URL || 'http://localhost:5173',
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
  emailHost: process.env.EMAIL_HOST || 'smtp.ethereal.email',
  emailPort: parseInt(process.env.EMAIL_PORT, 10) || 587,
  emailUser: process.env.EMAIL_USER,
  emailPass: process.env.EMAIL_PASS,
  emailFrom: process.env.EMAIL_FROM || 'noreply@skillnest.com',
  aiServiceUrl: process.env.AI_SERVICE_URL || 'http://localhost:8001',
  aiServiceApiKey: process.env.AI_SERVICE_API_KEY || 'skillnest_ai_key',
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000, // 15 mins
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  adminEmail: process.env.ADMIN_EMAIL || 'admin@skillnest.com',
  adminPassword: process.env.ADMIN_PASSWORD || 'Admin@123456'
};
