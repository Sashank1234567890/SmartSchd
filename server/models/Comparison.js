const mongoose = require('mongoose');

const comparisonSchema = new mongoose.Schema({
  scope: { type: String, default: 'ALL' }, // 'ALL' or 'CUSTOM'
  sectionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Section' }],
  sectionCount: { type: Number, default: 0 },
  totalSessions: { type: Number, default: 0 },
  runs: [{
    algorithm: { type: String, required: true },
    algorithmRunId: { type: mongoose.Schema.Types.ObjectId, ref: 'AlgorithmRun' },
    runtimeMs: { type: Number, default: 0 },
    scheduledCount: { type: Number, default: 0 },
    unscheduledCount: { type: Number, default: 0 },
    completionRate: { type: Number, default: 0 },
    searchNodes: { type: Number },
    backtracks: { type: Number },
    colorsUsed: { type: Number },
    validationStatus: { type: String },
    softMetrics: {
      facultyLoadStdDev: { type: Number, default: 0 },
      sameSubjectSameDayCount: { type: Number, default: 0 },
      dailyDistributionStdDev: { type: Number, default: 0 },
      studentIdleGapCount: { type: Number, default: 0 }
    }
  }],
  winners: {
    fastest: { type: String },
    highestCompletion: { type: String },
    bestDistribution: { type: String }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Comparison', comparisonSchema);
