const mongoose = require('mongoose');

const periodSchema = new mongoose.Schema({
  index: { type: Number, required: true },
  label: { type: String, required: true },
  start: { type: String, required: true }, // "09:30"
  end: { type: String, required: true },   // "10:25"
  isBreak: { type: Boolean, default: false },
  breakType: { 
    type: String, 
    enum: ['short', 'lunch', null], 
    default: null 
  }
}, { _id: false });

const dayTimingSchema = new mongoose.Schema({
  day: { type: String, required: true },
  start: { type: String, default: '09:30' },
  end: { type: String, default: '17:30' },
  maxPeriodIndex: { type: Number, default: 9 }, // Index after which classes wrap up
  note: { type: String, default: 'Full Day (9:30 AM - 5:30 PM)' }
}, { _id: false });

const defaultPeriods = [
  { index: 0, label: 'P1', start: '09:30', end: '10:25', isBreak: false, breakType: null },
  { index: 1, label: 'P2', start: '10:25', end: '11:20', isBreak: false, breakType: null },
  { index: 2, label: 'P3', start: '11:25', end: '12:20', isBreak: false, breakType: null },
  { index: 3, label: 'P4', start: '12:20', end: '13:15', isBreak: false, breakType: null },
  { index: 4, label: 'Lunch Break', start: '13:15', end: '14:00', isBreak: true, breakType: 'lunch' },
  { index: 5, label: 'P5', start: '14:00', end: '14:50', isBreak: false, breakType: null },
  { index: 6, label: 'P6', start: '14:50', end: '15:40', isBreak: false, breakType: null },
  { index: 7, label: 'P7', start: '15:45', end: '16:35', isBreak: false, breakType: null },
  { index: 8, label: 'P8', start: '16:35', end: '17:30', isBreak: false, breakType: null }
];

const defaultDayTimings = [
  { day: 'Mon', start: '09:30', end: '17:30', maxPeriodIndex: 9, note: 'Full Day (9:30 AM - 5:30 PM)' },
  { day: 'Tue', start: '09:30', end: '17:30', maxPeriodIndex: 9, note: 'Full Day (9:30 AM - 5:30 PM)' },
  { day: 'Wed', start: '09:30', end: '15:30', maxPeriodIndex: 6, note: 'Early Wrap-Up (9:30 AM - 3:30 PM)' },
  { day: 'Thu', start: '09:30', end: '17:30', maxPeriodIndex: 9, note: 'Full Day (9:30 AM - 5:30 PM)' },
  { day: 'Fri', start: '09:30', end: '17:30', maxPeriodIndex: 9, note: 'Full Day (9:30 AM - 5:30 PM)' }
];

const settingsSchema = new mongoose.Schema({
  workingDays: {
    type: [String],
    default: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
  },
  periods: {
    type: [periodSchema],
    default: defaultPeriods
  },
  dayTimings: {
    type: [dayTimingSchema],
    default: defaultDayTimings
  },
  constraintConfig: {
    weights: {
      gaps: { type: Number, default: 1 },
      workloadBalance: { type: Number, default: 1 },
      consecutiveTeaching: { type: Number, default: 1 },
      preferredSlots: { type: Number, default: 1 },
      distribution: { type: Number, default: 1 },
      earlyLate: { type: Number, default: 1 }
    },
    maxConsecutivePeriods: { type: Number, default: 3 }
  },
  engineDefaults: {
    backtrackingTimeLimitMs: { type: Number, default: 10000 },
    backtrackingNodeLimit: { type: Number, default: 5000000 }
  }
}, {
  timestamps: true
});

settingsSchema.statics.getSingleton = async function() {
  let doc = await this.findOne();
  if (!doc) {
    doc = await this.create({
      workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      periods: defaultPeriods,
      dayTimings: defaultDayTimings,
      constraintConfig: {
        weights: {
          gaps: 1,
          workloadBalance: 1,
          consecutiveTeaching: 1,
          preferredSlots: 1,
          distribution: 1,
          earlyLate: 1
        },
        maxConsecutivePeriods: 3
      },
      engineDefaults: {
        backtrackingTimeLimitMs: 10000,
        backtrackingNodeLimit: 5000000
      }
    });
  } else {
    // If doc exists but dayTimings or modern periods not populated, update it
    let modified = false;
    if (!doc.dayTimings || doc.dayTimings.length === 0) {
      doc.dayTimings = defaultDayTimings;
      modified = true;
    } else {
      const wed = doc.dayTimings.find(d => d.day === 'Wed');
      if (wed && wed.maxPeriodIndex !== 6) {
        wed.maxPeriodIndex = 6;
        modified = true;
      }
    }
    if (doc.periods && doc.periods.length <= 7) {
      doc.periods = defaultPeriods;
      modified = true;
    }
    if (modified) {
      await doc.save();
    }
  }
  return doc;
};

const Settings = mongoose.model('Settings', settingsSchema);

module.exports = Settings;
