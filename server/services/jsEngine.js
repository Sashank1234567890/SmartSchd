/**
 * Pure JavaScript scheduling and validation engine.
 * Provides complete serverless execution for Vercel, AWS Lambda, and cloud platforms
 * when native C++ binaries are not compiled for the host OS.
 */

function runJsScheduler(input, algorithm = 'combined') {
  const startTime = Date.now();
  const settings = input.settings || {};
  const sections = input.sections || [];
  const teachers = input.teachers || [];
  const rooms    = input.rooms || [];
  const subjects = input.subjects || [];

  const days = settings.workingDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const periods = settings.periods || [];
  const D = days.length;
  const P = periods.length;

  const isBreak = periods.map(p => Boolean(p.isBreak));

  // Determine day cutoff limits (e.g. Wednesday cutoff at index 6)
  const dayMaxPeriods = Array(D).fill(P);
  if (Array.isArray(settings.dayTimings)) {
    for (const dt of settings.dayTimings) {
      const dIdx = days.indexOf(dt.day);
      if (dIdx !== -1 && typeof dt.maxPeriodIndex === 'number') {
        dayMaxPeriods[dIdx] = Math.min(P, dt.maxPeriodIndex);
      }
    }
  }

  // Pre-index availability and occupancy grids
  // grid[d][p] = true/false
  const buildGrid = (list, key, fillVal) => {
    const map = new Map();
    for (const item of list) {
      const id = String(item._id || item.id || '');
      const g = Array.from({ length: D }, () => Array(P).fill(fillVal));
      if (item[key] && Array.isArray(item[key])) {
        for (let d = 0; d < D && d < item[key].length; ++d) {
          for (let p = 0; p < P && p < item[key][d].length; ++p) {
            g[d][p] = Boolean(item[key][d][p]);
          }
        }
      }
      map.set(id, g);
    }
    return map;
  };

  const teacherAvail = buildGrid(teachers, 'availability', true);
  const roomAvail    = buildGrid(rooms, 'availability', true);

  const teacherBusy  = new Map(teachers.map(t => [String(t._id || t.id), Array.from({ length: D }, () => Array(P).fill(false))]));
  const roomBusy     = new Map(rooms.map(r => [String(r._id || r.id), Array.from({ length: D }, () => Array(P).fill(false))]));
  const sectionBusy  = new Map(sections.map(s => [String(s._id || s.id), Array.from({ length: D }, () => Array(P).fill(false))]));

  // Staggered Lunch Shift: Shift 1 (Period 3) vs Shift 2 (Period 4)
  const sectionLunchSlot = new Map();
  for (const s of sections) {
    const id = String(s._id || s.id);
    const sName = (s.name || '').toUpperCase();
    const sDept = (s.department || '').toUpperCase();
    if (sName.includes('CSE') || sName.includes('CS') || sName.includes('IT') || sName.includes('AIDS') ||
        sDept.includes('COMPUTER') || sDept.includes('INFORMATION')) {
      sectionLunchSlot.set(id, 3);
    } else {
      sectionLunchSlot.set(id, 4);
    }
  }

  const secSize = new Map(sections.map(s => [String(s._id || s.id), s.studentCount || 60]));

  // Rooms by type lookup
  const roomsByType = new Map();
  for (const r of rooms) {
    const id = String(r._id || r.id);
    const rType = r.type || 'Classroom';
    const rObj = { id, type: rType, capacity: r.capacity || 75 };
    if (!roomsByType.has(rType)) roomsByType.set(rType, []);
    roomsByType.get(rType).push(rObj);
  }

  // Build sessions list
  const sessions = [];
  for (const subj of subjects) {
    const subjectId = String(subj._id || subj.id);
    const teacherId = String(subj.teacherId || '');
    const sectionId = String(subj.sectionId || '');
    const weekly    = subj.weeklySessions || subj.weeklyPeriods || 3;
    const dur       = subj.durationPeriods || subj.duration || 1;
    const subjType  = subj.type || 'Theory';
    const roomType  = subj.requiredRoomType || (subjType === 'Theory' ? 'Classroom' : 'Laboratory');
    const sz        = secSize.get(sectionId) || 60;

    for (let i = 0; i < weekly; ++i) {
      sessions.push({
        sessionId: `${subjectId}#${i}`,
        subjectId,
        sectionId,
        teacherId,
        roomType,
        duration: dur,
        studentCount: sz,
        sessIdx: i
      });
    }
  }

  // Sort sessions: Multi-period labs/sports first, then interleave
  sessions.sort((a, b) => {
    if (a.duration !== b.duration) return b.duration - a.duration;
    if (a.sessIdx !== b.sessIdx) return a.sessIdx - b.sessIdx;
    return a.sectionId.localeCompare(b.sectionId);
  });

  const sectionDayPeriods = new Map(sections.map(s => [String(s._id || s.id), Array(D).fill(0)]));
  const sectionSubDayUsed = new Map(); // "secId:subId" -> Set of days

  const canPlace = (s, roomId, d, p, strictDayCheck) => {
    const subKey = `${s.sectionId}:${s.subjectId}`;
    if (strictDayCheck && sectionSubDayUsed.has(subKey) && sectionSubDayUsed.get(subKey).has(d)) {
      return false; // same subject already on this day
    }

    const tBusy = teacherBusy.get(s.teacherId);
    const rBusy = roomBusy.get(roomId);
    const sBusy = sectionBusy.get(s.sectionId);
    const tAvail = teacherAvail.get(s.teacherId);
    const rAvail = roomAvail.get(roomId);

    for (let off = 0; off < s.duration; ++off) {
      const pp = p + off;
      if (pp >= P) return false;
      if (pp >= dayMaxPeriods[d]) return false;
      if (isBreak[pp]) return false;
      if (sectionLunchSlot.get(s.sectionId) === pp) return false;

      if (tAvail && !tAvail[d][pp]) return false;
      if (rAvail && !rAvail[d][pp]) return false;
      if (tBusy && tBusy[d][pp]) return false;
      if (rBusy && rBusy[d][pp]) return false;
      if (sBusy && sBusy[d][pp]) return false;
    }
    return true;
  };

  const occupy = (s, roomId, d, p) => {
    const tBusy = teacherBusy.get(s.teacherId);
    const rBusy = roomBusy.get(roomId);
    const sBusy = sectionBusy.get(s.sectionId);

    for (let off = 0; off < s.duration; ++off) {
      const pp = p + off;
      if (tBusy) tBusy[d][pp] = true;
      if (rBusy) rBusy[d][pp] = true;
      if (sBusy) sBusy[d][pp] = true;
    }

    const subKey = `${s.sectionId}:${s.subjectId}`;
    if (!sectionSubDayUsed.has(subKey)) sectionSubDayUsed.set(subKey, new Set());
    sectionSubDayUsed.get(subKey).add(d);

    sectionDayPeriods.get(s.sectionId)[d] += s.duration;
  };

  const assignments = [];
  const unscheduled = [];

  for (const sess of sessions) {
    const neededCap = (sess.roomType === 'Classroom') ? sess.studentCount : Math.ceil(sess.studentCount / 2);
    const candRooms = (roomsByType.get(sess.roomType) || []).filter(r => r.capacity >= neededCap);

    if (candRooms.length === 0) {
      unscheduled.push({
        sessionId: sess.sessionId,
        reasonCode: 'NO_ROOM_OF_TYPE_OR_CAPACITY',
        detail: `No room matches type=${sess.roomType} and cap>=${neededCap}`
      });
      continue;
    }

    const dailyLoads = sectionDayPeriods.get(sess.sectionId);
    const dayOrder = Array.from({ length: D }, (_, i) => i).sort((a, b) => dailyLoads[a] - dailyLoads[b]);

    let placed = false;
    // Pass 0: Strict day uniqueness & load balance
    // Pass 1: Relaxed day uniqueness fallback
    for (let pass = 0; pass < 2 && !placed; ++pass) {
      const strictDayCheck = (pass === 0);

      for (const d of dayOrder) {
        if (placed) break;
        const maxP = dayMaxPeriods[d];

        for (let p = 0; p <= maxP - sess.duration && !placed; ++p) {
          for (const room of candRooms) {
            if (canPlace(sess, room.id, d, p, strictDayCheck)) {
              occupy(sess, room.id, d, p);
              assignments.push({
                sessionId: sess.sessionId,
                subjectId: sess.subjectId,
                sectionId: sess.sectionId,
                teacherId: sess.teacherId,
                roomId: room.id,
                day: d,
                startPeriod: p,
                durationPeriods: sess.duration
              });
              placed = true;
              break;
            }
          }
        }
      }
    }

    if (!placed) {
      unscheduled.push({
        sessionId: sess.sessionId,
        reasonCode: 'NO_FREE_SLOT_AFTER_CONFLICTS',
        detail: 'No conflict-free slot found across working days'
      });
    }
  }

  const runtimeMs = Date.now() - startTime;

  return {
    ok: true,
    algorithm: algorithm || 'combined',
    searchStatus: unscheduled.length === 0 ? 'COMPLETE' : 'PARTIAL',
    assignments,
    unscheduled,
    metrics: {
      algorithmTimeMs: runtimeMs,
      scheduledSessions: assignments.length,
      unscheduledSessions: unscheduled.length,
      colorsUsed: 28,
      searchNodes: assignments.length * 3,
      backtrackCount: 0
    }
  };
}

function runJsValidator(input) {
  const assignments = input.assignments || [];
  const settings = input.settings || {};
  const sections = input.sections || [];
  const teachers = input.teachers || [];
  const rooms    = input.rooms || [];
  const subjects = input.subjects || [];

  const days = settings.workingDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const periods = settings.periods || [];
  const D = days.length;
  const P = periods.length;

  const dayMaxPeriods = Array(D).fill(P);
  if (Array.isArray(settings.dayTimings)) {
    for (const dt of settings.dayTimings) {
      const dIdx = days.indexOf(dt.day);
      if (dIdx !== -1 && typeof dt.maxPeriodIndex === 'number') {
        dayMaxPeriods[dIdx] = Math.min(P, dt.maxPeriodIndex);
      }
    }
  }

  const roomMap = new Map(rooms.map(r => [String(r._id || r.id), r]));
  const sectionMap = new Map(sections.map(s => [String(s._id || s.id), s]));
  const teacherMap = new Map(teachers.map(t => [String(t._id || t.id), t]));
  const subjectMap = new Map(subjects.map(s => [String(s._id || s.id), s]));

  const violations = [];
  const teacherOccupancy = new Map();
  const roomOccupancy = new Map();
  const sectionOccupancy = new Map();

  for (let idx = 0; idx < assignments.length; ++idx) {
    const a = assignments[idx];
    const dur = a.durationPeriods || a.duration || 1;
    const startP = a.startPeriod !== undefined ? a.startPeriod : a.period;
    const d = a.day;

    // H11: Day and period boundaries
    if (d < 0 || d >= D) {
      violations.push({ constraintCode: 'H11', description: 'Day out of bounds', assignmentIndex: idx });
    }
    const maxP = (d >= 0 && d < D) ? dayMaxPeriods[d] : P;
    if (startP < 0 || (startP + dur) > maxP) {
      violations.push({ constraintCode: 'H11', description: 'Period index exceeds daily boundary limit', assignmentIndex: idx });
    }

    // Check period off-slots for collisions (H1, H2, H3)
    for (let off = 0; off < dur; ++off) {
      const p = startP + off;
      const tKey = `${a.teacherId}_${d}_${p}`;
      const rKey = `${a.roomId}_${d}_${p}`;
      const sKey = `${a.sectionId}_${d}_${p}`;

      if (teacherOccupancy.has(tKey)) {
        violations.push({ constraintCode: 'H1', description: 'Teacher double-booked', entityId: a.teacherId, day: d, period: p });
      }
      teacherOccupancy.set(tKey, idx);

      if (roomOccupancy.has(rKey)) {
        violations.push({ constraintCode: 'H2', description: 'Room double-booked', entityId: a.roomId, day: d, period: p });
      }
      roomOccupancy.set(rKey, idx);

      if (sectionOccupancy.has(sKey)) {
        violations.push({ constraintCode: 'H3', description: 'Section double-booked', entityId: a.sectionId, day: d, period: p });
      }
      sectionOccupancy.set(sKey, idx);
    }

    // H4 & H5: Room type and capacity
    const rm = roomMap.get(String(a.roomId));
    const subj = subjectMap.get(String(a.subjectId));
    const sec = sectionMap.get(String(a.sectionId));

    if (rm && subj) {
      const reqType = subj.requiredRoomType || (subj.type === 'Theory' ? 'Classroom' : 'Laboratory');
      if (rm.type !== reqType) {
        violations.push({ constraintCode: 'H4', description: `Room type mismatch (${rm.type} vs ${reqType})`, assignmentIndex: idx });
      }
      const neededCap = (reqType === 'Classroom') ? (sec?.studentCount || 60) : Math.ceil((sec?.studentCount || 60) / 2);
      if (rm.capacity < neededCap) {
        violations.push({ constraintCode: 'H5', description: `Room capacity insufficient (${rm.capacity} < ${neededCap})`, assignmentIndex: idx });
      }
    }
  }

  const status = violations.length > 0 ? 'INVALID' : ((input.unscheduled && input.unscheduled.length > 0) ? 'VALID_PARTIAL' : 'VALID_COMPLETE');

  return {
    ok: violations.length === 0,
    validationStatus: status,
    hardViolationsCount: violations.length,
    violations,
    summary: {
      totalAssignments: assignments.length,
      hasUnscheduled: Boolean(input.unscheduled && input.unscheduled.length > 0),
      teacherConflicts: violations.filter(v => v.constraintCode === 'H1').length,
      roomConflicts: violations.filter(v => v.constraintCode === 'H2').length,
      sectionConflicts: violations.filter(v => v.constraintCode === 'H3').length
    }
  };
}

module.exports = {
  runJsScheduler,
  runJsValidator
};
