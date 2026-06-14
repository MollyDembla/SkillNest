const mongoose = require('mongoose');
const { success, error } = require('../utils/response');

const getCollection = (name) => mongoose.connection.collection(name);

// GET /progress/:studentId — aggregate progress stats for a student
const getProgressStats = async (req, res) => {
  try {
    const studentId = new mongoose.Types.ObjectId(req.params.studentId);

    const [enrollments, progress] = await Promise.all([
      getCollection('enrollments').find({ student: studentId }).toArray(),
      getCollection('progresses').find({ student: studentId }).toArray(),
    ]);

    const totalEnrolled = enrollments.length;
    const completed = enrollments.filter((e) => e.status === 'completed' || e.progressPercentage >= 100).length;
    const inProgress = enrollments.filter((e) => e.progressPercentage > 0 && e.progressPercentage < 100).length;
    const totalLessonsCompleted = progress.reduce((acc, p) => acc + (p.completedLessons?.length || 0), 0);
    const avgProgress = totalEnrolled > 0
      ? Math.round(enrollments.reduce((acc, e) => acc + (e.progressPercentage || 0), 0) / totalEnrolled)
      : 0;

    return success(res, 200, {
      totalEnrolled,
      completed,
      inProgress,
      notStarted: totalEnrolled - completed - inProgress,
      avgProgress,
      totalLessonsCompleted,
    }, 'Progress stats retrieved.');
  } catch (err) {
    console.error('[AI] Progress stats error:', err);
    return error(res, 500, 'Failed to retrieve progress stats.');
  }
};

module.exports = { getProgressStats };
