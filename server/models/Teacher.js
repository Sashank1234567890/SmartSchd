const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Teacher name is required'],
    trim: true
  },
  teacherCode: {
    type: String,
    required: [true, 'Teacher code is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  teachableSubjectCodes: {
    type: [String],
    default: []
  },
  // D x P boolean matrix
  availability: {
    type: [[Boolean]],
    default: []
  },
  maxWeeklyPeriods: {
    type: Number,
    required: [true, 'Max weekly periods is required'],
    min: [1, 'Max weekly periods must be at least 1']
  },
  preferredSlots: [{
    day: { type: Number, required: true },
    period: { type: Number, required: true }
  }]
}, {
  timestamps: true
});

const Teacher = mongoose.model('Teacher', teacherSchema);

module.exports = Teacher;
