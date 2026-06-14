const stripe = require('../config/stripe');
const config = require('../config/env');
const Payment = require('../models/Payment');
const paymentService = require('../services/paymentService');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');

const createPaymentIntent = asyncHandler(async (req, res) => {
  const result = await paymentService.createPaymentIntent(req.user._id);
  res.status(200).json(new ApiResponse(200, result, 'Payment intent created.'));
});

// Called by the client immediately after stripe.confirmPayment succeeds.
// Verifies with Stripe then fulfills the order — works without the webhook.
const confirmPayment = asyncHandler(async (req, res, next) => {
  const { paymentIntentId } = req.body;

  if (!paymentIntentId) {
    return next(new ApiError(400, 'paymentIntentId is required.'));
  }

  // Verify the PaymentIntent actually succeeded with Stripe
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  if (paymentIntent.status !== 'succeeded') {
    return next(new ApiError(400, 'Payment has not been completed.'));
  }

  // Security: ensure this PI belongs to the requesting user
  const payment = await Payment.findOne({ stripePaymentIntentId: paymentIntentId });
  if (payment && payment.user.toString() !== req.user._id.toString()) {
    return next(new ApiError(403, 'Unauthorized.'));
  }

  await paymentService.fulfillOrder(paymentIntentId);

  res.status(200).json(new ApiResponse(200, null, 'Order confirmed. Enrollments created.'));
});

// Raw handler — no asyncHandler so we control the response directly
const stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, config.stripeWebhookSecret);
  } catch (err) {
    return res.status(400).json({ error: `Webhook signature verification failed: ${err.message}` });
  }

  if (event.type === 'payment_intent.succeeded') {
    try {
      await paymentService.fulfillOrder(event.data.object.id);
    } catch (err) {
      console.error('Order fulfillment error:', err);
      return res.status(500).json({ error: 'Order fulfillment failed.' });
    }
  }

  res.status(200).json({ received: true });
};

const getPaymentHistory = asyncHandler(async (req, res) => {
  const payments = await paymentService.getUserPaymentHistory(req.user._id);
  res.status(200).json(new ApiResponse(200, { payments }, 'Payment history retrieved.'));
});

module.exports = { createPaymentIntent, confirmPayment, stripeWebhook, getPaymentHistory };
