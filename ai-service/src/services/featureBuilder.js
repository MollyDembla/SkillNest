const mongoose = require('mongoose');

// Read-only references to main service's collections
const Enrollment = mongoose.connection.collection
  ? null
  : null; // resolved lazily below

const getCollection = (name) => mongoose.connection.collection(name);

/**
 * Build a feature vector for a student from their enrollment history.
 * Returns:
 *   - categoryWeights: { [category]: count }
 *   - levelCounts: { beginner, intermediate, advanced, all }
 *   - enrolledInstructors: Set of instructor ObjectId strings
 *   - enrolledCourseIds: Set of course ObjectId strings
 *   - completedCategories: Set of categories where student finished a course
 *   - avgSpend: average spend per paid course
 */
const buildStudentFeatures = async (studentId) => {
  const enrollments = await getCollection('enrollments')
    .find({ student: new mongoose.Types.ObjectId(studentId) })
    .toArray();

  if (enrollments.length === 0) {
    return {
      categoryWeights: {},
      levelCounts: {},
      enrolledInstructors: new Set(),
      enrolledCourseIds: new Set(),
      completedCategories: new Set(),
      avgSpend: 0,
      isEmpty: true,
    };
  }

  const courseIds = enrollments.map((e) => e.course);
  const courses = await getCollection('courses')
    .find({ _id: { $in: courseIds } })
    .project({ _id: 1, category: 1, level: 1, instructor: 1, price: 1 })
    .toArray();

  const courseMap = {};
  for (const c of courses) courseMap[c._id.toString()] = c;

  const categoryWeights = {};
  const levelCounts = {};
  const enrolledInstructors = new Set();
  const enrolledCourseIds = new Set();
  const completedCategories = new Set();
  let totalSpend = 0;
  let paidCount = 0;

  for (const e of enrollments) {
    const course = courseMap[e.course?.toString()];
    if (!course) continue;

    enrolledCourseIds.add(e.course.toString());
    enrolledInstructors.add(course.instructor?.toString());

    // Weight category by completion: completed = 2x, in-progress = 1x
    const weight = e.status === 'completed' || e.progressPercentage >= 100 ? 2 : 1;
    categoryWeights[course.category] = (categoryWeights[course.category] || 0) + weight;
    levelCounts[course.level] = (levelCounts[course.level] || 0) + 1;

    if (e.status === 'completed' || e.progressPercentage >= 100) {
      completedCategories.add(course.category);
    }

    if (course.price > 0) {
      totalSpend += course.price;
      paidCount += 1;
    }
  }

  return {
    categoryWeights,
    levelCounts,
    enrolledInstructors,
    enrolledCourseIds,
    completedCategories,
    avgSpend: paidCount > 0 ? totalSpend / paidCount : 0,
    isEmpty: false,
  };
};

/**
 * Infer the next appropriate level for a student.
 * Logic: if they've completed intermediate, suggest advanced; etc.
 */
const inferNextLevel = (levelCounts, completedCategories, categoryWeights) => {
  const completed = Object.values(levelCounts).reduce((a, b) => a + b, 0);
  if (completed === 0) return null;

  const hasCompleted = (level) => (levelCounts[level] || 0) >= 1;
  if (hasCompleted('intermediate')) return 'advanced';
  if (hasCompleted('beginner')) return 'intermediate';
  return 'beginner';
};

module.exports = { buildStudentFeatures, inferNextLevel };
