const Section = require('../models/Section');
const Teacher = require('../models/Teacher');
const Room = require('../models/Room');
const Subject = require('../models/Subject');
const Settings = require('../models/Settings');

/**
 * Validates scheduling inputs before running any algorithm.
 * Errors block execution with HTTP 422.
 * Warnings inform the user about potential capacity or workload tightness.
 *
 * @param {string[]} [sectionIds] - Optional array of section IDs to validate. If omitted, validates all sections.
 * @returns {Promise<{ isValid: boolean, errors: Array<{code: string, message: string, details?: any}>, warnings: Array<{code: string, message: string, details?: any}> }>}
 */
async function validatePreflight(sectionIds = null) {
  const errors = [];
  const warnings = [];

  const settings = await Settings.getSingleton();
  const numDays = settings.workingDays.length;
  const nonBreakPeriods = settings.periods.filter(p => !p.isBreak);
  const totalWeeklyTeachingPeriods = numDays * nonBreakPeriods.length;

  // Find longest run of consecutive non-break periods in a single day
  let maxConsecutiveDaily = 0;
  let currentRun = 0;
  for (const p of settings.periods) {
    if (!p.isBreak) {
      currentRun++;
      if (currentRun > maxConsecutiveDaily) {
        maxConsecutiveDaily = currentRun;
      }
    } else {
      currentRun = 0;
    }
  }

  // Load target sections
  const sectionQuery = sectionIds && sectionIds.length > 0 ? { _id: { $in: sectionIds } } : {};
  const sections = await Section.find(sectionQuery);

  if (sections.length === 0) {
    errors.push({
      code: 'E_NO_SECTIONS',
      message: 'No sections selected or available for scheduling.'
    });
    return { isValid: false, errors, warnings };
  }

  const allTeachers = await Teacher.find();
  const teacherMap = new Map(allTeachers.map(t => [t._id.toString(), t]));

  const allRooms = await Room.find();

  // Validate each section and its subjects
  for (const section of sections) {
    if (!section.studentCount || section.studentCount <= 0) {
      errors.push({
        code: 'E_INVALID_SECTION_SIZE',
        message: `Section '${section.name}' has invalid student count (${section.studentCount}). Must be > 0.`,
        details: { sectionId: section._id, studentCount: section.studentCount }
      });
    }

    const subjects = await Subject.find({ sectionId: section._id });
    if (subjects.length === 0) {
      warnings.push({
        code: 'W_NO_SUBJECTS',
        message: `Section '${section.name}' has no subjects registered.`,
        details: { sectionId: section._id }
      });
      continue;
    }

    let sectionTotalPeriods = 0;

    for (const sub of subjects) {
      const periodRequirement = sub.weeklySessions * sub.durationPeriods;
      sectionTotalPeriods += periodRequirement;

      // Check teacher reference
      const teacher = teacherMap.get(sub.teacherId?.toString());
      if (!teacher) {
        errors.push({
          code: 'E_MISSING_TEACHER',
          message: `Subject '${sub.code} - ${sub.name}' references non-existent teacher ID ${sub.teacherId}.`,
          details: { subjectId: sub._id, teacherId: sub.teacherId }
        });
        continue;
      }

      // Check A4: Teachable subjects qualification
      if (teacher.teachableSubjectCodes && teacher.teachableSubjectCodes.length > 0) {
        if (!teacher.teachableSubjectCodes.includes(sub.code)) {
          errors.push({
            code: 'E_TEACHER_NOT_QUALIFIED',
            message: `Teacher '${teacher.name}' (${teacher.teacherCode}) is not qualified to teach subject code '${sub.code}'.`,
            details: {
              subjectId: sub._id,
              subjectCode: sub.code,
              teacherId: teacher._id,
              qualifiedCodes: teacher.teachableSubjectCodes
            }
          });
        }
      }

      // Check if session duration exceeds longest non-break block
      if (sub.durationPeriods > maxConsecutiveDaily) {
        errors.push({
          code: 'E_DURATION_EXCEEDS_BLOCK',
          message: `Subject '${sub.code}' requires ${sub.durationPeriods} consecutive periods, but the longest non-break period run in a day is ${maxConsecutiveDaily}.`,
          details: { subjectId: sub._id, durationPeriods: sub.durationPeriods, maxConsecutiveDaily }
        });
      }

      // Check Room suitability warning (A7)
      // When batch is divided into G1/G2 for labs, needed lab room capacity is ~section.studentCount / 2
      const isLabOrSports = sub.type === 'Lab' || sub.type === 'Practical' || sub.durationPeriods === 2;
      const expectedRoomType = sub.requiredRoomType || (isLabOrSports ? 'Laboratory' : 'Classroom');
      const neededCapacity = isLabOrSports ? Math.ceil(section.studentCount / 2) : section.studentCount;
      const suitableRooms = allRooms.filter(r => 
        (r.type === expectedRoomType || (expectedRoomType === 'Laboratory' && r.type.includes('Lab'))) &&
        r.capacity >= neededCapacity
      );

      if (suitableRooms.length === 0) {
        warnings.push({
          code: 'W_NO_SUITABLE_ROOM',
          message: `No ${expectedRoomType} exists with capacity >= ${neededCapacity} for section '${section.name}' (Subject: ${sub.code}).`,
          details: { sectionId: section._id, subjectId: sub._id, requiredType: expectedRoomType, neededCapacity, studentCount: section.studentCount }
        });
      }
    }

    if (sectionTotalPeriods > totalWeeklyTeachingPeriods) {
      errors.push({
        code: 'E_SECTION_PERIODS_EXCEEDED',
        message: `Section '${section.name}' requires ${sectionTotalPeriods} teaching periods per week, which exceeds the total available teaching periods (${totalWeeklyTeachingPeriods}).`,
        details: { sectionId: section._id, sectionTotalPeriods, totalWeeklyTeachingPeriods }
      });
    }
  }

  // Workload Warnings for Teachers
  for (const teacher of allTeachers) {
    const assignedSubjects = await Subject.find({ teacherId: teacher._id });
    const totalAssignedPeriods = assignedSubjects.reduce((sum, s) => sum + (s.weeklySessions * s.durationPeriods), 0);

    if (totalAssignedPeriods > teacher.maxWeeklyPeriods) {
      warnings.push({
        code: 'W_TEACHER_OVERLOAD',
        message: `Teacher '${teacher.name}' is assigned ${totalAssignedPeriods} weekly periods, which exceeds their max limit of ${teacher.maxWeeklyPeriods}.`,
        details: { teacherId: teacher._id, totalAssignedPeriods, maxWeeklyPeriods: teacher.maxWeeklyPeriods }
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

module.exports = {
  validatePreflight
};
