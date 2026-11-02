const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const Section = require('../models/Section');
const Room = require('../models/Room');
const Teacher = require('../models/Teacher');
const Subject = require('../models/Subject');
const Settings = require('../models/Settings');

// Helper to load seed object into MongoDB
async function loadSeedObject(rawData) {
  const summary = {
    sectionsImported: 0,
    roomsImported: 0,
    teachersImported: 0,
    subjectsImported: 0,
    warnings: []
  };

  const settingsDoc = await Settings.getSingleton();
  const D = settingsDoc.workingDays.length;
  const P = settingsDoc.periods.length;
  const defaultMatrix = Array.from({ length: D }, () => Array(P).fill(true));

  // 1. Sections
  const sectionMap = new Map();
  if (Array.isArray(rawData.sections)) {
    for (const s of rawData.sections) {
      if (!s.name) continue;
      const sName = s.name.trim();
      const sec = await Section.findOneAndUpdate(
        { name: sName },
        {
          name: sName,
          department: s.department || 'General',
          studentCount: parseInt(s.studentCount, 10) || 60
        },
        { upsert: true, new: true, runValidators: true }
      );
      sectionMap.set(sName.toUpperCase(), sec._id);
      sectionMap.set(sec._id.toString(), sec._id);
      summary.sectionsImported++;
    }
  }

  // 2. Rooms
  if (Array.isArray(rawData.rooms)) {
    for (const r of rawData.rooms) {
      if (!r.roomNumber) continue;
      const rNum = r.roomNumber.trim();
      const validRoomTypes = [
        'Classroom', 'Laboratory', 'ComputerLab', 'ElectronicsLab',
        'ElectricalLab', 'MechanicalWorkshop', 'CivilLab', 'PhysicsLab',
        'ChemistryLab', 'SportsGround'
      ];
      const rType = validRoomTypes.includes(r.type) ? r.type : (r.type === 'Lab' ? 'Laboratory' : 'Classroom');

      await Room.findOneAndUpdate(
        { roomNumber: rNum },
        {
          name: r.name || `Room ${rNum}`,
          roomNumber: rNum,
          type: rType,
          capacity: parseInt(r.capacity, 10) || 70,
          availability: Array.isArray(r.availability) && r.availability.length === D
            ? r.availability
            : defaultMatrix
        },
        { upsert: true, new: true, runValidators: true }
      );
      summary.roomsImported++;
    }
  }

  // 3. Teachers
  const teacherMap = new Map();
  if (Array.isArray(rawData.teachers)) {
    for (const t of rawData.teachers) {
      if (!t.teacherCode) continue;
      const tCode = t.teacherCode.trim().toUpperCase();
      const teachableCodes = Array.isArray(t.teachableSubjectCodes)
        ? t.teachableSubjectCodes.map(c => c.trim().toUpperCase())
        : (t.teachableCodes ? t.teachableCodes.map(c => c.trim().toUpperCase()) : []);

      const teacher = await Teacher.findOneAndUpdate(
        { teacherCode: tCode },
        {
          name: t.name || `Faculty ${tCode}`,
          teacherCode: tCode,
          teachableSubjectCodes: teachableCodes,
          maxWeeklyPeriods: parseInt(t.maxWeeklyPeriods, 10) || 18,
          availability: Array.isArray(t.availability) && t.availability.length === D
            ? t.availability
            : defaultMatrix,
          preferredSlots: Array.isArray(t.preferredSlots) ? t.preferredSlots : []
        },
        { upsert: true, new: true, runValidators: true }
      );
      teacherMap.set(tCode, teacher._id);
      teacherMap.set(teacher._id.toString(), teacher._id);
      summary.teachersImported++;
    }
  }

  // Refresh lookups
  const allTeachers = await Teacher.find();
  allTeachers.forEach(t => {
    teacherMap.set(t.teacherCode.toUpperCase(), t._id);
    teacherMap.set(t._id.toString(), t._id);
  });
  const allSections = await Section.find();
  allSections.forEach(s => {
    sectionMap.set(s.name.toUpperCase(), s._id);
    sectionMap.set(s._id.toString(), s._id);
  });

  // 4. Subjects
  if (Array.isArray(rawData.subjects)) {
    for (const sub of rawData.subjects) {
      if (!sub.code) continue;
      const subCode = sub.code.trim().toUpperCase();

      let secId = null;
      if (sub.sectionId && sectionMap.has(sub.sectionId.toString())) {
        secId = sectionMap.get(sub.sectionId.toString());
      } else if (sub.sectionName && sectionMap.has(sub.sectionName.toUpperCase())) {
        secId = sectionMap.get(sub.sectionName.toUpperCase());
      } else if (sub.section && sectionMap.has(sub.section.toUpperCase())) {
        secId = sectionMap.get(sub.section.toUpperCase());
      } else if (allSections.length > 0) {
        secId = allSections[0]._id;
      }

      let tId = null;
      if (sub.teacherId && teacherMap.has(sub.teacherId.toString())) {
        tId = teacherMap.get(sub.teacherId.toString());
      } else if (sub.teacherCode && teacherMap.has(sub.teacherCode.toUpperCase())) {
        tId = teacherMap.get(sub.teacherCode.toUpperCase());
      } else if (sub.teacher && teacherMap.has(sub.teacher.toUpperCase())) {
        tId = teacherMap.get(sub.teacher.toUpperCase());
      } else if (allTeachers.length > 0) {
        tId = allTeachers[0]._id;
      }

      if (!secId || !tId) continue;

      const subType = sub.type === 'Lab' || sub.type === 'Practical' ? sub.type : 'Theory';
      const duration = parseInt(sub.durationPeriods, 10) || (subType === 'Theory' ? 1 : 2);
      const weekly = parseInt(sub.weeklySessions, 10) || 3;

      await Subject.findOneAndUpdate(
        { code: subCode, sectionId: secId },
        {
          name: sub.name || `Course ${subCode}`,
          code: subCode,
          type: subType,
          sectionId: secId,
          teacherId: tId,
          weeklySessions: weekly,
          durationPeriods: duration,
          requiredRoomType: sub.requiredRoomType || null,
          notes: sub.notes || ''
        },
        { upsert: true, new: true, runValidators: true }
      );
      summary.subjectsImported++;
    }
  }

  return summary;
}

// POST /api/dev/import-json
router.post('/import-json', async (req, res, next) => {
  try {
    const rawData = req.body;
    if (!rawData || typeof rawData !== 'object') {
      return res.status(400).json({
        success: false,
        data: null,
        error: { code: 'E_INVALID_JSON', message: 'Request body must be a valid JSON object.' }
      });
    }
    const summary = await loadSeedObject(rawData);
    res.json({ success: true, data: summary, error: null });
  } catch (err) {
    next(err);
  }
});

// POST /api/dev/seed/:datasetName (per SPEC Section 5 & 7)
router.post('/seed/:datasetName', async (req, res, next) => {
  try {
    const { datasetName } = req.params;
    const cleanName = datasetName.replace(/[^a-zA-Z0-9_-]/g, '');
    const seedPath = path.resolve(__dirname, `../seeds/${cleanName}.json`);

    if (!fs.existsSync(seedPath)) {
      return res.status(404).json({
        success: false,
        data: null,
        error: {
          code: 'E_SEED_NOT_FOUND',
          message: `Seed dataset '${datasetName}' not found. Available datasets: small, medium, large, teacher_unavailable, full_room_capacity, shared_teacher_conflicts, shared_section_conflicts, labs_needing_consecutive_periods, insufficient_rooms, impossible_timetable.`
        }
      });
    }

    const fileContent = fs.readFileSync(seedPath, 'utf8');
    const rawData = JSON.parse(fileContent);

    // Wipe previous test data if ?clean=true
    if (req.query.clean === 'true') {
      await Subject.deleteMany({});
      await Teacher.deleteMany({});
      await Room.deleteMany({});
      await Section.deleteMany({});
    }

    const summary = await loadSeedObject(rawData);
    summary.datasetLoaded = cleanName;

    res.json({ success: true, data: summary, error: null });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/dev/seed (clear all test data per SPEC Section 5)
router.delete('/seed', async (req, res, next) => {
  try {
    await Subject.deleteMany({});
    await Teacher.deleteMany({});
    await Room.deleteMany({});
    await Section.deleteMany({});

    res.json({
      success: true,
      data: { message: 'All sections, rooms, teachers, and subjects cleared from smartsched database.' },
      error: null
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/dev/export-json
router.get('/export-json', async (req, res, next) => {
  try {
    const [settings, sections, rooms, teachers, subjects] = await Promise.all([
      Settings.getSingleton(),
      Section.find().sort({ name: 1 }),
      Room.find().sort({ roomNumber: 1 }),
      Teacher.find().sort({ teacherCode: 1 }),
      Subject.find().populate('teacherId', 'teacherCode name').populate('sectionId', 'name').sort({ code: 1 })
    ]);

    const formattedSubjects = subjects.map(s => ({
      name: s.name,
      code: s.code,
      type: s.type,
      sectionName: s.sectionId?.name || '',
      teacherCode: s.teacherId?.teacherCode || '',
      weeklySessions: s.weeklySessions,
      durationPeriods: s.durationPeriods,
      requiredRoomType: s.requiredRoomType,
      notes: s.notes
    }));

    const exportPayload = {
      metadata: {
        exportedAt: new Date().toISOString(),
        system: 'SmartSched DAA Timetable System'
      },
      settings: {
        workingDays: settings.workingDays,
        periods: settings.periods,
        constraintConfig: settings.constraintConfig
      },
      sections: sections.map(s => ({ name: s.name, department: s.department, studentCount: s.studentCount })),
      rooms: rooms.map(r => ({ name: r.name, roomNumber: r.roomNumber, type: r.type, capacity: r.capacity, availability: r.availability })),
      teachers: teachers.map(t => ({
        name: t.name,
        teacherCode: t.teacherCode,
        teachableSubjectCodes: t.teachableSubjectCodes,
        maxWeeklyPeriods: t.maxWeeklyPeriods,
        availability: t.availability,
        preferredSlots: t.preferredSlots
      })),
      subjects: formattedSubjects
    };

    res.json({
      success: true,
      data: exportPayload,
      error: null
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
