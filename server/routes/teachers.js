const express = require('express');
const router = express.Router();
const Teacher = require('../models/Teacher');
const Subject = require('../models/Subject');
const Settings = require('../models/Settings');

// Helper to normalize availability matrix
async function getNormalizedAvailability(availability) {
  const settings = await Settings.getSingleton();
  const D = settings.workingDays.length;
  const P = settings.periods.length;

  if (Array.isArray(availability) && availability.length === D) {
    return availability.map(row => {
      if (Array.isArray(row) && row.length === P) {
        return row.map(cell => Boolean(cell));
      }
      return Array(P).fill(true);
    });
  }

  return Array.from({ length: D }, () => Array(P).fill(true));
}

// GET /api/teachers
router.get('/', async (req, res, next) => {
  try {
    const { search } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { teacherCode: { $regex: search, $options: 'i' } }
      ];
    }

    const teachers = await Teacher.find(filter).sort({ name: 1 });
    res.json({ success: true, data: teachers, error: null });
  } catch (err) {
    next(err);
  }
});

// GET /api/teachers/:id
router.get('/:id', async (req, res, next) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({
        success: false,
        data: null,
        error: { code: 'E_NOT_FOUND', message: `Teacher '${req.params.id}' not found.` }
      });
    }
    res.json({ success: true, data: teacher, error: null });
  } catch (err) {
    next(err);
  }
});

// POST /api/teachers
router.post('/', async (req, res, next) => {
  try {
    const { name, teacherCode, teachableSubjectCodes, availability, maxWeeklyPeriods, preferredSlots } = req.body;
    const normalizedAvailability = await getNormalizedAvailability(availability);

    const teacher = await Teacher.create({
      name,
      teacherCode,
      teachableSubjectCodes: Array.isArray(teachableSubjectCodes) ? teachableSubjectCodes : [],
      availability: normalizedAvailability,
      maxWeeklyPeriods: maxWeeklyPeriods || 18,
      preferredSlots: Array.isArray(preferredSlots) ? preferredSlots : []
    });

    res.status(201).json({ success: true, data: teacher, error: null });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        data: null,
        error: { code: 'E_DUPLICATE_TEACHER_CODE', message: `Teacher code '${req.body.teacherCode}' already exists.` }
      });
    }
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

// PUT /api/teachers/:id
router.put('/:id', async (req, res, next) => {
  try {
    const { name, teacherCode, teachableSubjectCodes, availability, maxWeeklyPeriods, preferredSlots } = req.body;
    const updateData = { name, teacherCode, maxWeeklyPeriods };

    if (teachableSubjectCodes !== undefined) {
      updateData.teachableSubjectCodes = Array.isArray(teachableSubjectCodes) ? teachableSubjectCodes : [];
    }
    if (preferredSlots !== undefined) {
      updateData.preferredSlots = Array.isArray(preferredSlots) ? preferredSlots : [];
    }
    if (availability) {
      updateData.availability = await getNormalizedAvailability(availability);
    }

    const teacher = await Teacher.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!teacher) {
      return res.status(404).json({
        success: false,
        data: null,
        error: { code: 'E_NOT_FOUND', message: `Teacher '${req.params.id}' not found.` }
      });
    }

    res.json({ success: true, data: teacher, error: null });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        data: null,
        error: { code: 'E_DUPLICATE_TEACHER_CODE', message: `Teacher code '${req.body.teacherCode}' already exists.` }
      });
    }
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

// DELETE /api/teachers/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({
        success: false,
        data: null,
        error: { code: 'E_NOT_FOUND', message: `Teacher '${req.params.id}' not found.` }
      });
    }

    // Reference check per PART B Section 3: Deleting a record referenced elsewhere returns HTTP 409
    const assignedCount = await Subject.countDocuments({ teacherId: req.params.id });
    if (assignedCount > 0) {
      return res.status(409).json({
        success: false,
        data: null,
        error: {
          code: 'E_REFERENCED_RESOURCE',
          message: `Cannot delete teacher '${teacher.name}': assigned to ${assignedCount} subject(s). Please reassign those subjects first.`,
          details: { assignedCount, entity: 'Teacher', id: req.params.id }
        }
      });
    }

    await Teacher.findByIdAndDelete(req.params.id);
    res.json({ success: true, data: { message: `Teacher '${teacher.name}' deleted successfully.` }, error: null });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
