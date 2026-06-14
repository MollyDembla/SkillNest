const mongoose = require('mongoose');
const { buildStudentFeatures, inferNextLevel } = require('./featureBuilder');
const { getCategoryCompletionRates } = require('./progressScoring');
const { rankCourses } = require('./rankingService');
const RecommendationLog = require('../models/RecommendationLog');
const logger = require('../utils/logger');

const getCollection = (name) => mongoose.connection.collection(name);

const LIMIT = 8;

/**
 * Get personalised course recommendations for a student.
 *
 * Flow:
 *  1. Build student feature vector from enrollment history
 *  2. If cold start (no enrollments) → return top-rated published courses
 *  3. Generate candidate pool: published courses NOT already enrolled
 *  4. Narrow candidates to preferred categories first; fall back to all if < LIMIT
 *  5. Score & rank candidates
 *  6. Log recommendations for future retraining
 */
const getRecommendations = async (studentId, limit = LIMIT) => {
  const [features, completionRates] = await Promise.all([
    buildStudentFeatures(studentId),
    getCategoryCompletionRates(studentId),
  ]);

  // Cold start: no enrollment history → return top-rated courses
  if (features.isEmpty) {
    logger.info('Cold start for student', studentId);
    const popular = await getCollection('courses')
      .find({ status: 'published' })
      .sort({ averageRating: -1, reviewsCount: -1 })
      .limit(limit)
      .project({ _id: 1, title: 1, subtitle: 1, thumbnail: 1, category: 1, level: 1, price: 1, averageRating: 1, reviewsCount: 1, instructor: 1, slug: 1 })
      .toArray();

    // Populate instructor name
    return populateInstructors(popular);
  }

  const nextLevel = inferNextLevel(features.levelCounts, features.completedCategories, features.categoryWeights);
  const excludeIds = [...features.enrolledCourseIds].map((id) => new mongoose.Types.ObjectId(id));

  // Top preferred categories (by weight)
  const topCategories = Object.entries(features.categoryWeights)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([cat]) => cat);

  // Candidate pool — start with preferred categories
  let candidates = await getCollection('courses')
    .find({
      status: 'published',
      _id: { $nin: excludeIds },
      category: { $in: topCategories },
    })
    .project({ _id: 1, title: 1, subtitle: 1, thumbnail: 1, category: 1, level: 1, price: 1, averageRating: 1, reviewsCount: 1, instructor: 1, slug: 1 })
    .toArray();

  // Fall back to all published courses if not enough candidates
  if (candidates.length < limit) {
    const extraIds = candidates.map((c) => c._id);
    const extra = await getCollection('courses')
      .find({
        status: 'published',
        _id: { $nin: [...excludeIds, ...extraIds] },
      })
      .project({ _id: 1, title: 1, subtitle: 1, thumbnail: 1, category: 1, level: 1, price: 1, averageRating: 1, reviewsCount: 1, instructor: 1, slug: 1 })
      .limit(40)
      .toArray();
    candidates = [...candidates, ...extra];
  }

  if (candidates.length === 0) {
    return [];
  }

  const ranked = rankCourses(candidates, features, nextLevel, completionRates);
  const top = ranked.slice(0, limit);

  // Async log (don't await — non-blocking)
  RecommendationLog.create({
    student: studentId,
    recommendedCourses: top.map((c) => c._id),
    algorithm: 'content_based_v1',
    metadata: { topCategories, nextLevel, candidateCount: candidates.length },
  }).catch((err) => logger.error('Failed to log recommendations', err));

  return populateInstructors(top);
};

/** Populate instructor name for each course using a single DB query */
const populateInstructors = async (courses) => {
  if (courses.length === 0) return [];
  const instructorIds = [...new Set(courses.map((c) => c.instructor?.toString()).filter(Boolean))];
  const instructors = await getCollection('users')
    .find({ _id: { $in: instructorIds.map((id) => new mongoose.Types.ObjectId(id)) } })
    .project({ _id: 1, name: 1, avatar: 1 })
    .toArray();

  const instructorMap = {};
  for (const i of instructors) instructorMap[i._id.toString()] = i;

  return courses.map((c) => ({
    ...c,
    instructor: instructorMap[c.instructor?.toString()] || { name: 'Unknown' },
  }));
};

module.exports = { getRecommendations };
