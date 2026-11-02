const express = require('express');
const router = express.Router();
const Section = require('../models/Section');
const Subject = require('../models/Subject');

// GET /api/sections
router.get('/', async (req, res, next) => {
  try {
    const { search, department } = req.query;
    const filter = {};

    if (department) {
      filter.department = department;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } }
      ];
    }

    const sections = await Section.find(filter).sort({ name: 1 });
    res.json({ success: true, data: sections, error: null });
  } catch (err) {
    next(err);
  }
});

// GET /api/sections/:id
router.get('/:id', async (req, res, next) => {
  try {
    const section = await Section.findById(req.params.id);
    if (!section) {
      return res.status(404).json({
        success: false,
        data: null,
        error: { code: 'E_NOT_FOUND', message: `Section '${req.params.id}' not found.` }
      });
    }
    res.json({ success: true, data: section, error: null });
  } catch (err) {
    next(err);
  }
});

// POST /api/sections
router.post('/', async (req, res, next) => {
  try {
    const { name, department, studentCount } = req.body;
    const section = await Section.create({ name, department, studentCount });
    res.status(201).json({ success: true, data: section, error: null });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        data: null,
        error: { code: 'E_DUPLICATE_NAME', message: `Section with name '${req.body.name}' already exists.` }
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

// PUT /api/sections/:id
router.put('/:id', async (req, res, next) => {
  try {
    const { name, department, studentCount } = req.body;
    const section = await Section.findByIdAndUpdate(
      req.params.id,
      { name, department, studentCount },
      { new: true, runValidators: true }
    );
    if (!section) {
      return res.status(404).json({
        success: false,
        data: null,
        error: { code: 'E_NOT_FOUND', message: `Section '${req.params.id}' not found.` }
      });
    }
    res.json({ success: true, data: section, error: null });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        data: null,
        error: { code: 'E_DUPLICATE_NAME', message: `Section with name '${req.body.name}' already exists.` }
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

// DELETE /api/sections/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const section = await Section.findById(req.params.id);
    if (!section) {
      return res.status(404).json({
        success: false,
        data: null,
        error: { code: 'E_NOT_FOUND', message: `Section '${req.params.id}' not found.` }
      });
    }

    // Check if any subject references this section
    const referencedCount = await Subject.countDocuments({ sectionId: req.params.id });
    if (referencedCount > 0) {
      return res.status(409).json({
        success: false,
        data: null,
        error: {
          code: 'E_REFERENCED_RESOURCE',
          message: `Cannot delete section '${section.name}': referenced by ${referencedCount} subject(s). Please delete or reassign those subjects first.`,
          details: { referencedCount, entity: 'Section', id: req.params.id }
        }
      });
    }

    await Section.findByIdAndDelete(req.params.id);
    res.json({ success: true, data: { message: `Section '${section.name}' deleted successfully.` }, error: null });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
