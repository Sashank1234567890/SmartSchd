const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Subject name is required'],
    trim: true
  },
  code: {
    type: String,
    required: [true, 'Subject code is required'],
    trim: true,
    uppercase: true
  },
  type: {
    type: String,
    required: [true, 'Subject type is required'],
    enum: ['Theory', 'Practical', 'Lab']
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: [true, 'Teacher is required']
  },
  sectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section',
    required: [true, 'Section is required']
  },
  weeklySessions: {
    type: Number,
    required: [true, 'Weekly sessions count is required'],
    min: [1, 'Weekly sessions must be at least 1']
  },
  durationPeriods: {
    type: Number,
    required: [true, 'Duration in periods is required'],
    min: [1, 'Duration must be at least 1 period'],
    default: 1
  },
  requiredRoomType: {
    type: String,
    enum: [
      'Classroom',
      'Laboratory',
      'ComputerLab',
      'ElectronicsLab',
      'ElectricalLab',
      'MechanicalWorkshop',
      'CivilLab',
      'PhysicsLab',
      'ChemistryLab',
      'SportsGround',
      null
    ],
    default: null
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Unique index on (code, sectionId) per SPEC Section 3 & A3
subjectSchema.index({ code: 1, sectionId: 1 }, { unique: true });

const Subject = mongoose.model('Subject', subjectSchema);

module.exports = Subject;
