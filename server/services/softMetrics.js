/**
 * Utility to calculate soft constraint penalties and balance metrics
 * from a generated schedule's assignments.
 */

function standardDeviation(array) {
  if (!array || array.length <= 1) return 0;
  const n = array.length;
  const mean = array.reduce((a, b) => a + b, 0) / n;
  const variance = array.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
  return Math.sqrt(variance);
}

function computeSoftMetrics(assignments, { sections = [], teachers = [], subjects = [], numDays = 5 } = {}) {
  if (!Array.isArray(assignments) || assignments.length === 0) {
    return {
      facultyLoadStdDev: 0,
      sameSubjectSameDayCount: 0,
      dailyDistributionStdDev: 0,
      studentIdleGapCount: 0,
      roomDisciplineMismatches: 0
    };
  }

  // 1. Same-subject same-day count
  // Map: `${sectionId}-${day}-${subjectId}` -> count
  const sectionDaySubjectMap = new Map();
  let sameSubjectSameDayCount = 0;

  // 2. Faculty daily load: teacherId -> array of 5 days count
  const teacherDayLoad = new Map();
  for (const t of teachers) {
    teacherDayLoad.set(t._id.toString(), new Array(numDays).fill(0));
  }

  // 3. Section daily load: sectionId -> array of 5 days count
  const sectionDayLoad = new Map();
  // 4. Section day periods for gaps: `${sectionId}-${day}` -> Set of periods
  const sectionDayPeriods = new Map();

  for (const s of sections) {
    const sId = s._id.toString();
    sectionDayLoad.set(sId, new Array(numDays).fill(0));
  }

  let roomDisciplineMismatches = 0;
  const subjectMap = new Map();
  for (const sub of subjects) {
    subjectMap.set(sub._id.toString(), sub);
  }

  for (const a of assignments) {
    const secId = a.sectionId?.toString();
    const tchId = a.teacherId?.toString();
    const subId = a.subjectId?.toString();
    const day = a.day;
    const period = a.period;

    if (day === undefined || day >= numDays) continue;

    // Faculty load
    if (tchId && teacherDayLoad.has(tchId)) {
      teacherDayLoad.get(tchId)[day] += 1;
    }

    // Section load
    if (secId && sectionDayLoad.has(secId)) {
      sectionDayLoad.get(secId)[day] += 1;
    }

    // Same subject same day
    if (secId && subId) {
      const key = `${secId}-${day}-${subId}`;
      const cnt = (sectionDaySubjectMap.get(key) || 0) + 1;
      sectionDaySubjectMap.set(key, cnt);
      if (cnt === 2) {
        sameSubjectSameDayCount += 1;
      }
    }

    // Periods for gaps
    if (secId && period !== undefined) {
      const dpKey = `${secId}-${day}`;
      if (!sectionDayPeriods.has(dpKey)) {
        sectionDayPeriods.set(dpKey, new Set());
      }
      sectionDayPeriods.get(dpKey).add(period);
    }
  }

  // Compute Faculty Load Std Dev
  const teacherStdDevs = [];
  for (const [_, days] of teacherDayLoad.entries()) {
    const totalPeriods = days.reduce((a, b) => a + b, 0);
    if (totalPeriods > 0) {
      teacherStdDevs.push(standardDeviation(days));
    }
  }
  const avgFacultyStdDev = teacherStdDevs.length > 0
    ? teacherStdDevs.reduce((a, b) => a + b, 0) / teacherStdDevs.length
    : 0;

  // Compute Section Distribution Std Dev
  const sectionStdDevs = [];
  for (const [_, days] of sectionDayLoad.entries()) {
    const totalPeriods = days.reduce((a, b) => a + b, 0);
    if (totalPeriods > 0) {
      sectionStdDevs.push(standardDeviation(days));
    }
  }
  const avgSectionStdDev = sectionStdDevs.length > 0
    ? sectionStdDevs.reduce((a, b) => a + b, 0) / sectionStdDevs.length
    : 0;

  // Compute Student Idle Gaps
  let studentIdleGapCount = 0;
  for (const [_, periodsSet] of sectionDayPeriods.entries()) {
    if (periodsSet.size <= 1) continue;
    const sorted = Array.from(periodsSet).sort((a, b) => a - b);
    const minP = sorted[0];
    const maxP = sorted[sorted.length - 1];
    // Any period between minP and maxP not in set is an idle gap
    for (let p = minP + 1; p < maxP; p++) {
      if (!periodsSet.has(p)) {
        studentIdleGapCount += 1;
      }
    }
  }

  return {
    facultyLoadStdDev: Math.round(avgFacultyStdDev * 100) / 100,
    sameSubjectSameDayCount,
    dailyDistributionStdDev: Math.round(avgSectionStdDev * 100) / 100,
    studentIdleGapCount,
    roomDisciplineMismatches
  };
}

module.exports = {
  computeSoftMetrics
};
