/**
 * GET /api/timetables/runs  — list recent AlgorithmRun records
 * GET /api/timetables/runs/:id — get one run with full schedule data
 */
const express = require('express');
const router = express.Router();
const AlgorithmRun = require('../models/AlgorithmRun');

function envelope(success, data = null, error = null) {
  return { success, data, error };
}

// List recent runs (last 50)
router.get('/', async (req, res) => {
  try {
    const runs = await AlgorithmRun.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    return res.json(envelope(true, runs));
  } catch (err) {
    return res.status(500).json(envelope(false, null, { code: 'E_INTERNAL', message: err.message }));
  }
});

// List recent runs (last 50) - alias /runs
router.get('/runs', async (req, res) => {
  try {
    const runs = await AlgorithmRun.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    return res.json(envelope(true, runs));
  } catch (err) {
    return res.status(500).json(envelope(false, null, { code: 'E_INTERNAL', message: err.message }));
  }
});

// Get single run
router.get('/runs/:id', async (req, res) => {
  try {
    const run = await AlgorithmRun.findById(req.params.id).lean();
    if (!run) {
      return res.status(404).json(envelope(false, null, { code: 'E_NOT_FOUND', message: 'Run not found' }));
    }
    return res.json(envelope(true, run));
  } catch (err) {
    return res.status(500).json(envelope(false, null, { code: 'E_INTERNAL', message: err.message }));
  }
});

module.exports = router;
