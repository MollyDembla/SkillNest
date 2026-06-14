const Stripe = require('stripe');
const config = require('./env');

const stripe = new Stripe(config.stripeSecretKey || '', {
  apiVersion: '2025-01-27' // Using a modern stable api version compat with stripe 22+
});

module.exports = stripe;
