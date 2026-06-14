const mongoose = require('mongoose');

const recommendationLogSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, required: true },
    recommendedCourses: [{ type: mongoose.Schema.Types.ObjectId }],
    algorithm: { type: String, default: 'content_based_v1' },
    metadata: { type: Object, default: {} },
  },
  { timestamps: true }
);

recommendationLogSchema.index({ student: 1, createdAt: -1 });

module.exports = mongoose.model('RecommendationLog', recommendationLogSchema);
