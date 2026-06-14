const { getRecommendations } = require('../services/recommendationEngine');
const { success, error } = require('../utils/response');

const getForStudent = async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const limit = Math.min(parseInt(req.query.limit, 10) || 8, 20);

    if (!studentId) return error(res, 400, 'studentId is required.');

    const recommendations = await getRecommendations(studentId, limit);
    return success(res, 200, { recommendations }, 'Recommendations retrieved.');
  } catch (err) {
    console.error('[AI] Recommendation error:', err);
    return error(res, 500, 'Failed to generate recommendations.');
  }
};

module.exports = { getForStudent };
