const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Section name is required'],
    unique: true,
    trim: true
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true
  },
  studentCount: {
    type: Number,
    required: [true, 'Student count is required'],
    min: [1, 'Student count must be at least 1']
  }
}, {
  timestamps: true
});

const Section = mongoose.model('Section', sectionSchema);

module.exports = Section;
