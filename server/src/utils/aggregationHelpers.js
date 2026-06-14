const mongoose = require('mongoose');

/**
 * Helper: creates a $match stage that filters by instructorId across course references.
 * @param {string} instructorId - MongoDB ID of the instructor
 */
const matchByInstructor = (instructorId) => ({
  $match: {
    instructor: new mongoose.Types.ObjectId(instructorId)
  }
});

/**
 * Group aggregation results by year and month
 * @param {string} dateField - Schema path of the date field (e.g. '$createdAt')
 */
const groupByMonth = (dateField = '$createdAt') => ({
  $group: {
    _id: {
      year: { $year: dateField },
      month: { $month: dateField }
    },
    count: { $sum: 1 }
  }
});

/**
 * Calculate total revenue grouped by month
 * @param {string} amountField - Schema path of the transaction amount (e.g. '$amount')
 * @param {string} dateField - Schema path of the date field
 */
const revenueByMonth = (amountField = '$amount', dateField = '$createdAt') => ({
  $group: {
    _id: {
      year: { $year: dateField },
      month: { $month: dateField }
    },
    revenue: { $sum: amountField },
    count: { $sum: 1 }
  }
});

/**
 * Sorts aggregation results chronologically (year ASC, month ASC)
 */
const sortChronologically = () => ({
  $sort: { '_id.year': 1, '_id.month': 1 }
});

module.exports = {
  matchByInstructor,
  groupByMonth,
  revenueByMonth,
  sortChronologically
};
