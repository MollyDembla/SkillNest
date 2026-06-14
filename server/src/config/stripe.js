const Stripe = require('stripe');
const config = require('./env');

const stripe = new Stripe(config.stripeSecretKey || '');

module.exports = stripe;
