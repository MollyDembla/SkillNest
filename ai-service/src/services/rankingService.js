/**
 * Score a single candidate course given the student's feature vector.
 *
 * Scoring breakdown (max ~40 points):
 *  - Category alignment   : 0–14 pts  (based on how often student enrolled in this category)
 *  - Level progression    : 0–8  pts  (if this is the next appropriate level)
 *  - Known instructor     : 0–4  pts  (previously enrolled with this instructor)
 *  - Course quality       : 0–10 pts  (rating × reviewCount signal)
 *  - Popularity           : 0–4  pts  (enrollment count signal via reviewsCount proxy)
 */
const scoreCourse = (course, features, nextLevel, completionRates) => {
  let score = 0;

  // 1. Category alignment
  const totalCategoryWeight = Object.values(features.categoryWeights).reduce((a, b) => a + b, 0) || 1;
  const catWeight = features.categoryWeights[course.category] || 0;
  const catRatio = catWeight / totalCategoryWeight; // 0–1
  score += catRatio * 14;

  // Boost: student has completed courses in this category (engagement signal)
  if (features.completedCategories.has(course.category)) score += 2;

  // Adjustment: if student tends to abandon this category, penalize slightly
  const completionRate = completionRates[course.category];
  if (completionRate !== undefined && completionRate < 0.3) score -= 2;

  // 2. Level progression
  if (nextLevel && course.level === nextLevel) score += 8;
  else if (course.level === 'all') score += 3; // always relevant

  // 3. Known instructor
  if (features.enrolledInstructors.has(course.instructor?.toString())) score += 4;

  // 4. Course quality  (averageRating 0–5, reviewsCount signal)
  const ratingScore = (course.averageRating || 0) * 1.5;
  const reviewSignal = Math.log10((course.reviewsCount || 0) + 2) * 1.5; // +2 avoids log(1)=0
  score += Math.min(ratingScore + reviewSignal, 10);

  // 5. Popularity proxy
  score += Math.min(Math.log10((course.reviewsCount || 0) + 2) * 2, 4);

  return score;
};

/**
 * Rank candidate courses. Returns sorted array with scores attached.
 */
const rankCourses = (candidates, features, nextLevel, completionRates) => {
  return candidates
    .map((course) => ({
      ...course,
      _score: scoreCourse(course, features, nextLevel, completionRates),
    }))
    .sort((a, b) => b._score - a._score);
};

module.exports = { rankCourses };
