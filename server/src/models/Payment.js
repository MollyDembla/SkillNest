const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    courseIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
      }
    ],
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: 0
    },
    currency: {
      type: String,
      default: 'usd'
    },
    stripeSessionId: {
      type: String,
      sparse: true,
      unique: true
    },
    stripePaymentIntentId: {
      type: String,
      sparse: true,
      unique: true
    },
    status: {
      type: String,
      enum: ['pending', 'succeeded', 'failed', 'refunded'],
      default: 'pending'
    }
  },
  {
    timestamps: true
  }
);

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
