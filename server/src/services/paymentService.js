const stripe = require('../config/stripe');
const Cart = require('../models/Cart');
const Course = require('../models/Course');
const Payment = require('../models/Payment');
const Order = require('../models/Order');
const Enrollment = require('../models/Enrollment');
const ApiError = require('../utils/apiError');

const createPaymentIntent = async (userId) => {
  const cart = await Cart.findOne({ user: userId }).populate('items', 'title price _id');

  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, 'Cart is empty. Add courses before checkout.');
  }

  const totalAmount = cart.items.reduce((sum, course) => sum + (course.price || 0), 0);
  const amountInCents = Math.round(totalAmount * 100);

  if (amountInCents < 50) {
    throw new ApiError(400, 'Order total is below the minimum payment amount ($0.50).');
  }

  const courseIds = cart.items.map((c) => c._id);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountInCents,
    currency: 'usd',
    payment_method_types: ['card'],
    metadata: {
      userId: userId.toString(),
      courseIds: courseIds.map((id) => id.toString()).join(','),
    },
  });

  await Payment.create({
    user: userId,
    courseIds,
    amount: totalAmount,
    currency: 'usd',
    stripePaymentIntentId: paymentIntent.id,
    status: 'pending',
  });

  return {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
    amount: totalAmount,
    currency: 'usd',
    items: cart.items.map((c) => ({ _id: c._id, title: c.title, price: c.price })),
  };
};

// Called by the Stripe webhook on payment_intent.succeeded — idempotent
const fulfillOrder = async (paymentIntentId) => {
  const payment = await Payment.findOne({ stripePaymentIntentId: paymentIntentId });

  if (!payment || payment.status === 'succeeded') return;

  payment.status = 'succeeded';
  await payment.save();

  const courses = await Course.find({ _id: { $in: payment.courseIds } }).select('_id price');

  await Order.create({
    user: payment.user,
    items: courses.map((c) => ({ course: c._id, price: c.price })),
    totalAmount: payment.amount,
    paymentStatus: 'paid',
    paymentMethod: 'stripe',
  });

  // Upsert enrollments — safe to call multiple times
  if (payment.courseIds.length > 0) {
    const ops = payment.courseIds.map((courseId) => ({
      updateOne: {
        filter: { student: payment.user, course: courseId },
        update: { $setOnInsert: { student: payment.user, course: courseId, status: 'active' } },
        upsert: true,
      },
    }));
    await Enrollment.bulkWrite(ops);
  }

  await Cart.findOneAndUpdate({ user: payment.user }, { items: [] });
};

const getUserPaymentHistory = async (userId) => {
  return Payment.find({ user: userId, status: 'succeeded' })
    .populate('courseIds', 'title thumbnail')
    .sort({ createdAt: -1 });
};

module.exports = { createPaymentIntent, fulfillOrder, getUserPaymentHistory };
