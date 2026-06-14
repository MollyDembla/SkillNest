const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true
    },
    title: {
      type: String,
      required: [true, 'Lesson title is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    videoUrl: {
      type: String,
      default: ''
    },
    videoDuration: {
      type: Number, // in seconds
      default: 0
    },
    isPreview: {
      type: Boolean,
      default: false
    },
    order: {
      type: Number,
      required: true,
      default: 0
    },
    resources: [
      {
        title: {
          type: String,
          required: true
        },
        url: {
          type: String,
          required: true
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

// Compiling index for efficient query by course and sorting by order
lessonSchema.index({ course: 1, order: 1 });

const Lesson = mongoose.model('Lesson', lessonSchema);

module.exports = Lesson;
