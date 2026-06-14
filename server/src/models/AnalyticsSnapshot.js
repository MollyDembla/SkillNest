const mongoose = require('mongoose');

const analyticsSnapshotSchema = new mongoose.Schema(
  {
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course' // Optional: if null, represents total aggregate for the instructor
    },
    revenue: {
      type: Number,
      default: 0
    },
    enrollmentCount: {
      type: Number,
      default: 0
    },
    completionCount: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0
    },
    snapshotDate: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Index to query snapshots by instructor and date range
analyticsSnapshotSchema.index({ instructor: 1, snapshotDate: -1 });

const AnalyticsSnapshot = mongoose.model('AnalyticsSnapshot', analyticsSnapshotSchema);

module.exports = AnalyticsSnapshot;
