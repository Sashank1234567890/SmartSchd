const mongoose = require('mongoose');

const algorithmRunSchema = new mongoose.Schema({
  algorithm: { type: String, required: true },
  parameters: { type: Object, default: {} },
  inputHash: { type: String, required: true },
  inputSnapshotSummary: { type: String },
  engineStatus: { type: String }, // e.g., COMPLETED, TIMEOUT_INCOMPLETE
  metrics: { type: Object },
  hardViolations: { type: [Object] },
  validationStatus: { type: String, enum: ['VALID_COMPLETE','VALID_PARTIAL','INVALID'] },
  assignments: { type: [Object], default: [] },
  unscheduled: { type: [Object], default: [] },
  comparisonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comparison' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AlgorithmRun', algorithmRunSchema);
