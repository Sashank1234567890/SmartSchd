const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');

// GET /api/settings
router.get('/', async (req, res, next) => {
  try {
    const settings = await Settings.getSingleton();
    res.json({ success: true, data: settings, error: null });
  } catch (err) {
    next(err);
  }
});

// PUT /api/settings
router.put('/', async (req, res, next) => {
  try {
    const { workingDays, periods, dayTimings, constraintConfig, engineDefaults } = req.body;
    let settings = await Settings.getSingleton();

    if (workingDays && Array.isArray(workingDays) && workingDays.length > 0) {
      settings.workingDays = workingDays;
    }

    if (periods && Array.isArray(periods) && periods.length > 0) {
      settings.periods = periods;
    }

    if (dayTimings && Array.isArray(dayTimings) && dayTimings.length > 0) {
      settings.dayTimings = dayTimings;
    }

    if (constraintConfig) {
      if (constraintConfig.weights) {
        settings.constraintConfig.weights = {
          ...settings.constraintConfig.weights,
          ...constraintConfig.weights
        };
      }
      if (typeof constraintConfig.maxConsecutivePeriods === 'number') {
        settings.constraintConfig.maxConsecutivePeriods = constraintConfig.maxConsecutivePeriods;
      }
    }

    if (engineDefaults) {
      if (typeof engineDefaults.backtrackingTimeLimitMs === 'number') {
        settings.engineDefaults.backtrackingTimeLimitMs = engineDefaults.backtrackingTimeLimitMs;
      }
      if (typeof engineDefaults.backtrackingNodeLimit === 'number') {
        settings.engineDefaults.backtrackingNodeLimit = engineDefaults.backtrackingNodeLimit;
      }
    }

    await settings.save();
    res.json({ success: true, data: settings, error: null });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        data: null,
        error: { code: 'E_VALIDATION_ERROR', message: err.message }
      });
    }
    next(err);
  }
});

module.exports = router;
