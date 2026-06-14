const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: [true, 'Rating (1 to 5) is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [500, 'Comment cannot exceed 500 characters']
    }
  },
  {
    timestamps: true
  }
);

// One review per student per course
reviewSchema.index({ course: 1, student: 1 }, { unique: true });

// Static method to calculate average rating
reviewSchema.statics.calculateAverageRating = async function (courseId) {
  const stats = await this.aggregate([
    {
      $match: { course: courseId }
    },
    {
      $group: {
        _id: '$course',
        averageRating: { $avg: '$rating' },
        reviewsCount: { $sum: 1 }
      }
    }
  ]);

  try {
    if (stats.length > 0) {
      await mongoose.model('Course').findByIdAndUpdate(courseId, {
        averageRating: Math.round(stats[0].averageRating * 10) / 10,
        reviewsCount: stats[0].reviewsCount
      });
    } else {
      await mongoose.model('Course').findByIdAndUpdate(courseId, {
        averageRating: 0,
        reviewsCount: 0
      });
    }
  } catch (error) {
    console.error('Error recalculating average rating:', error);
  }
};

// Recalculate average rating after saving
reviewSchema.post('save', function () {
  this.constructor.calculateAverageRating(this.course);
});

// Recalculate average rating before removing or updating
reviewSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    await doc.constructor.calculateAverageRating(doc.course);
  }
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
