const express = require('express');
const router = express.Router();
const Subject = require('../models/Subject');
const Teacher = require('../models/Teacher');
const Section = require('../models/Section');

// Helper to check A4: Teachable subjects qualification
async function checkTeacherQualification(teacherId, subjectCode) {
  const teacher = await Teacher.findById(teacherId);
  if (!teacher) {
    return {
      qualified: false,
      error: { code: 'E_NOT_FOUND', message: `Teacher '${teacherId}' not found.` }
    };
  }

  if (teacher.teachableSubjectCodes && teacher.teachableSubjectCodes.length > 0) {
    if (!teacher.teachableSubjectCodes.includes(subjectCode.toUpperCase())) {
      return {
        qualified: false,
        error: {
          code: 'E_TEACHER_NOT_QUALIFIED',
          message: `Teacher '${teacher.name}' (${teacher.teacherCode}) is not qualified to teach subject code '${subjectCode}'. Qualified codes: [${teacher.teachableSubjectCodes.join(', ')}].`
        }
      };
    }
  }

  return { qualified: true, teacher };
}

// GET /api/subjects
router.get('/', async (req, res, next) => {
  try {
    const { search, sectionId, teacherId, type } = req.query;
    const filter = {};

    if (sectionId) filter.sectionId = sectionId;
    if (teacherId) filter.teacherId = teacherId;
    if (type) filter.type = type;

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } }
      ];
    }

    const subjects = await Subject.find(filter)
      .populate('teacherId', 'name teacherCode teachableSubjectCodes')
      .populate('sectionId', 'name department studentCount')
      .sort({ code: 1, name: 1 });

    res.json({ success: true, data: subjects, error: null });
  } catch (err) {
    next(err);
  }
});

// GET /api/subjects/:id
router.get('/:id', async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id)
      .populate('teacherId', 'name teacherCode teachableSubjectCodes')
      .populate('sectionId', 'name department studentCount');

    if (!subject) {
      return res.status(404).json({
        success: false,
        data: null,
        error: { code: 'E_NOT_FOUND', message: `Subject '${req.params.id}' not found.` }
      });
    }
    res.json({ success: true, data: subject, error: null });
  } catch (err) {
    next(err);
  }
});

// POST /api/subjects
router.post('/', async (req, res, next) => {
  try {
    const {
      name,
      code,
      type,
      teacherId,
      sectionId,
      weeklySessions,
      durationPeriods,
      requiredRoomType,
      notes
    } = req.body;

    const upperCode = code ? code.trim().toUpperCase() : '';

    // Check Section existence
    const section = await Section.findById(sectionId);
    if (!section) {
      return res.status(404).json({
        success: false,
        data: null,
        error: { code: 'E_NOT_FOUND', message: `Section '${sectionId}' not found.` }
      });
    }

    // Check A4: Teacher qualification
    const qualCheck = await checkTeacherQualification(teacherId, upperCode);
    if (!qualCheck.qualified) {
      const statusCode = qualCheck.error.code === 'E_TEACHER_NOT_QUALIFIED' ? 422 : 404;
      return res.status(statusCode).json({
        success: false,
        data: null,
        error: qualCheck.error
      });
    }

    // Default duration: 1 for Theory, 2 for Practical/Lab if not explicitly passed
    const effectiveDuration = durationPeriods || (type === 'Theory' ? 1 : 2);

    const subject = await Subject.create({
      name,
      code: upperCode,
      type,
      teacherId,
      sectionId,
      weeklySessions,
      durationPeriods: effectiveDuration,
      requiredRoomType: requiredRoomType || null,
      notes: notes || ''
    });

    const populated = await Subject.findById(subject._id)
      .populate('teacherId', 'name teacherCode')
      .populate('sectionId', 'name department');

    res.status(201).json({ success: true, data: populated, error: null });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        data: null,
        error: {
          code: 'E_DUPLICATE_SUBJECT',
          message: `Subject with code '${req.body.code}' already exists for this section.`
        }
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

// PUT /api/subjects/:id
router.put('/:id', async (req, res, next) => {
  try {
    const existing = await Subject.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        data: null,
        error: { code: 'E_NOT_FOUND', message: `Subject '${req.params.id}' not found.` }
      });
    }

    const {
      name,
      code,
      type,
      teacherId,
      sectionId,
      weeklySessions,
      durationPeriods,
      requiredRoomType,
      notes
    } = req.body;

    const targetCode = code ? code.trim().toUpperCase() : existing.code;
    const targetTeacherId = teacherId || existing.teacherId;

    // Check A4 if code or teacher is modified
    if (code || teacherId) {
      const qualCheck = await checkTeacherQualification(targetTeacherId, targetCode);
      if (!qualCheck.qualified) {
        const statusCode = qualCheck.error.code === 'E_TEACHER_NOT_QUALIFIED' ? 422 : 404;
        return res.status(statusCode).json({
          success: false,
          data: null,
          error: qualCheck.error
        });
      }
    }

    const updated = await Subject.findByIdAndUpdate(
      req.params.id,
      {
        name,
        code: targetCode,
        type,
        teacherId: targetTeacherId,
        sectionId: sectionId || existing.sectionId,
        weeklySessions,
        durationPeriods,
        requiredRoomType: requiredRoomType !== undefined ? requiredRoomType : existing.requiredRoomType,
        notes: notes !== undefined ? notes : existing.notes
      },
      { new: true, runValidators: true }
    )
      .populate('teacherId', 'name teacherCode')
      .populate('sectionId', 'name department');

    res.json({ success: true, data: updated, error: null });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        data: null,
        error: {
          code: 'E_DUPLICATE_SUBJECT',
          message: `Subject with code '${req.body.code}' already exists for this section.`
        }
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

// DELETE /api/subjects/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({
        success: false,
        data: null,
        error: { code: 'E_NOT_FOUND', message: `Subject '${req.params.id}' not found.` }
      });
    }

    await Subject.findByIdAndDelete(req.params.id);
    res.json({ success: true, data: { message: `Subject '${subject.code}' deleted successfully.` }, error: null });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
