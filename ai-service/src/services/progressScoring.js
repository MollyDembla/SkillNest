const mongoose = require('mongoose');

const getCollection = (name) => mongoose.connection.collection(name);

/**
 * Compute completion rate per category for a student.
 * Used to down-rank categories where the student tends to abandon courses.
 */
const getCategoryCompletionRates = async (studentId) => {
  const enrollments = await getCollection('enrollments')
    .find({ student: new mongoose.Types.ObjectId(studentId) })
    .toArray();

  if (enrollments.length === 0) return {};

  const courseIds = enrollments.map((e) => e.course);
  const courses = await getCollection('courses')
    .find({ _id: { $in: courseIds } })
    .project({ _id: 1, category: 1 })
    .toArray();

  const courseMap = {};
  for (const c of courses) courseMap[c._id.toString()] = c;

  const stats = {};
  for (const e of enrollments) {
    const course = courseMap[e.course?.toString()];
    if (!course) continue;
    const cat = course.category;
    if (!stats[cat]) stats[cat] = { total: 0, completed: 0 };
    stats[cat].total += 1;
    if (e.status === 'completed' || e.progressPercentage >= 80) {
      stats[cat].completed += 1;
    }
  }

  const rates = {};
  for (const [cat, s] of Object.entries(stats)) {
    rates[cat] = s.total > 0 ? s.completed / s.total : 0;
  }
  return rates;
};

module.exports = { getCategoryCompletionRates };
