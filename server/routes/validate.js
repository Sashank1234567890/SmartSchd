const express = require('express');
const router = express.Router();
const { validatePreflight } = require('../services/preflightValidator');
const { runEngine, verifyBinaryExists } = require('../services/engineRunner');
const Settings = require('../models/Settings');
const Section = require('../models/Section');
const Teacher = require('../models/Teacher');
const Room = require('../models/Room');
const Subject = require('../models/Subject');

// POST /api/validate/schedule
router.post('/schedule', async (req, res, next) => {
  try {
    const { assignments = [], unscheduled = [] } = req.body;

    const [settings, sections, teachers, rooms, subjects] = await Promise.all([
      Settings.getSingleton(),
      Section.find().lean(),
      Teacher.find().lean(),
      Room.find().lean(),
      Subject.find().lean()
    ]);

    const validatorInput = {
      mode: 'validate',
      settings,
      sections,
      teachers,
      rooms,
      subjects,
      assignments,
      unscheduled
    };

    if (!verifyBinaryExists('validator')) {
      throw new Error('validator binary not found');
    }

    const validationResult = await runEngine('validator', validatorInput);

    return res.json({
      success: true,
      data: validationResult,
      error: null
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/validate/preflight
router.post('/preflight', async (req, res, next) => {
  try {
    const { sectionIds } = req.body;
    const result = await validatePreflight(sectionIds);

    if (!result.isValid) {
      return res.status(422).json({
        success: false,
        data: result,
        error: {
          code: 'E_PREFLIGHT_FAILED',
          message: 'Pre-flight validation detected hard constraint impossibilities.',
          details: result.errors
        }
      });
    }

    res.json({
      success: true,
      data: result,
      error: null
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
