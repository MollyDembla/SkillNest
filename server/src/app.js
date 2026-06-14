const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const corsOptions = require('./config/cors');
const { apiLimiter } = require('./middlewares/rateLimitMiddleware');
const errorHandler = require('./middlewares/errorMiddleware');
const ApiError = require('./utils/apiError');

// Import Route modules
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const courseRoutes = require('./routes/courseRoutes');
const instructorRoutes = require('./routes/instructorRoutes');
const studentRoutes = require('./routes/studentRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const cartRoutes = require('./routes/cartRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const progressRoutes = require('./routes/progressRoutes');
const chatRoutes = require('./routes/chatRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const adminRoutes = require('./routes/adminRoutes');
const aiRoutes = require('./routes/aiRoutes');
const lessonRoutes = require('./routes/lessonRoutes');

const app = express();

// 1. Security Headers
app.use(helmet());

// 2. Logging in development
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// 3. CORS
app.use(cors(corsOptions));

// 4. Body parsing (includes raw body verification for Stripe webhook signature verification)
app.use(
  express.json({
    verify: (req, res, buf) => {
      if (req.originalUrl && req.originalUrl.includes('/webhook')) {
        req.rawBody = buf;
      }
    }
  })
);
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 5. Cookie parsing
app.use(cookieParser());

// 6. Rate Limiting for all API routes
app.use('/api', apiLimiter);

// 7. Base Check Route
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date(),
    uptime: process.uptime()
  });
});

// 8. Register Route groups
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/courses', courseRoutes);
app.use('/api/v1/instructor', instructorRoutes);
app.use('/api/v1/students', studentRoutes);
app.use('/api/v1/wishlist', wishlistRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/enrollments', enrollmentRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/progress', progressRoutes);
app.use('/api/v1/chat', chatRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/lessons', lessonRoutes);

// 9. Catch-all for undefined routes
app.use((req, res, next) => {
  next(new ApiError(404, `Route ${req.originalUrl} not found on this server.`));
});

// 10. Centralized error handling
app.use(errorHandler);

module.exports = app;
