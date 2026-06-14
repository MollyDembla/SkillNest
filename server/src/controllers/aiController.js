const Course = require('../models/Course');
const aiBridge = require('../services/aiBridgeService');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * GET /ai/recommendations
 * Returns personalised course recommendations for the logged-in student.
 * Falls back to top-rated published courses if the AI service is unavailable.
 */
const getRecommendations = asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 8, 20);

  // Try AI service first
  let recommendations = await aiBridge.getRecommendations(req.user._id.toString(), limit);

  // Fallback: AI service unavailable — serve top-rated courses not already enrolled
  if (!recommendations) {
    const Enrollment = require('../models/Enrollment');
    const enrolled = await Enrollment.find({ student: req.user._id }).select('course');
    const enrolledIds = enrolled.map((e) => e.course);

    recommendations = await Course.find({
      status: 'published',
      _id: { $nin: enrolledIds },
    })
      .populate('instructor', 'name avatar')
      .sort({ averageRating: -1, reviewsCount: -1 })
      .limit(limit)
      .select('title subtitle thumbnail category level price averageRating reviewsCount instructor slug');
  }

  res.status(200).json(
    new ApiResponse(200, { recommendations }, 'Recommendations retrieved.')
  );
});

/**
 * GET /ai/health
 * Proxies the AI service health check. Useful for debugging.
 */
const checkAiHealth = asyncHandler(async (req, res) => {
  const healthy = await aiBridge.ping();
  res.status(200).json(
    new ApiResponse(200, { aiServiceOnline: healthy }, healthy ? 'AI service is online.' : 'AI service is offline (fallback active).')
  );
});

module.exports = { getRecommendations, checkAiHealth };
