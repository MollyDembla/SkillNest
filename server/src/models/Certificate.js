const mongoose = require('mongoose');
const crypto = require('crypto');

const certificateSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true
    },
    certificateId: {
      type: String,
      unique: true
    },
    issueDate: {
      type: Date,
      default: Date.now
    },
    studentNameSnapshot: {
      type: String,
      required: true
    },
    courseNameSnapshot: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Pre-save hook to generate unique certificate UUID
certificateSchema.pre('save', function (next) {
  if (!this.certificateId) {
    this.certificateId = crypto.randomUUID();
  }
  next();
});

// Student and course compound unique index to prevent duplicate certificates
certificateSchema.index({ student: 1, course: 1 }, { unique: true });

const Certificate = mongoose.model('Certificate', certificateSchema);

module.exports = Certificate;
