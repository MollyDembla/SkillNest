const express = require('express');
const { createPaymentIntent, confirmPayment, stripeWebhook, getPaymentHistory } = require('../controllers/paymentController');
const { protect } = require('../middlewares/authMiddleware');
const { restrictTo } = require('../middlewares/roleMiddleware');

const router = express.Router();

// Stripe webhook — must receive raw body (configured in app.js)
router.post('/webhook', stripeWebhook);

router.use(protect);

router.post('/create-intent', restrictTo('student'), createPaymentIntent);
router.post('/confirm', restrictTo('student'), confirmPayment);
router.get('/history', restrictTo('student'), getPaymentHistory);

module.exports = router;
