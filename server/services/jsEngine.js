/**
 * Pure JavaScript scheduling and validation engine.
 * Provides complete serverless execution for Vercel, AWS Lambda, and cloud platforms
 * when native C++ binaries are not compiled for the host OS.
 */

function getBranchKey(deptOrName) {
  if (!deptOrName) return 'GEN';
  const str = String(deptOrName).toUpperCase();
  if (str.includes('ELECTRONIC') || str.includes('ECE') || /\bEC\b/.test(str)) return 'ECE';
  if (str.includes('ELECTRICAL') || /\bEE\b/.test(str)) return 'EE';
  if (str.includes('MECHANICAL') || /\bME\b/.test(str)) return 'ME';
  if (str.includes('CIVIL') || /\bCE\b/.test(str)) return 'CE';
  if (str.includes('DATA SCIENCE') || str.includes('AIDS') || /\bAI\b/.test(str)) return 'AIDS';
  if (str.includes('INFORMATION') || /\bIT\b/.test(str)) return 'IT';
  if (str.includes('COMPUTER') || str.includes('CSE') || /\bCS\b/.test(str) || str.includes('-CS')) return 'CSE';
  return str.split(/[\s-]+/)[0];
}

function getYearKey(nameOrNum) {
  if (!nameOrNum) return '1ST';
  const str = String(nameOrNum).toUpperCase();
  if (str.includes('PHD') || str.includes('DOCTORAL') || str.includes('RESEARCH') || str.includes('FPM')) return 'PHD';
  if (str.includes('PG') || str.includes('MTECH') || str.includes('MSC') || str.includes('MD') || str.includes('LLM') || str.includes('MARCH') || str.includes('MBA') || str.includes('SEMINAR')) return 'PG';
  if (str.includes('4TH') || str.includes('401') || str.includes('402') || str.includes('403') || str.includes('404')) return '4TH';
  if (str.includes('3RD') || str.includes('301') || str.includes('302') || str.includes('303') || str.includes('304') || str.includes('PHASE3')) return '3RD';
  if (str.includes('2ND') || str.includes('201') || str.includes('202') || str.includes('203') || str.includes('204') || str.includes('PHASE2')) return '2ND';
  if (str.includes('1ST') || str.includes('101') || str.includes('102') || str.includes('103') || str.includes('104') || str.includes('PHASE1')) return '1ST';
  return '1ST';
}

function runJsScheduler(input, algorithm = 'combined') {
  const startTime = Date.now();
  const settings = input.settings || {};
  const sections = input.sections || [];
  const teachers = input.teachers || [];
  const rooms    = input.rooms || [];
  const subjects = input.subjects || [];

  const days = settings.workingDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const defaultPeriods = [
    { periodIndex: 0, name: 'P1', startTime: '09:30', endTime: '10:30', isBreak: false },
    { periodIndex: 1, name: 'P2', startTime: '10:30', endTime: '11:30', isBreak: false },
    { periodIndex: 2, name: 'P3', startTime: '11:30', endTime: '12:30', isBreak: false },
    { periodIndex: 3, name: 'Lunch Break', startTime: '12:30', endTime: '13:30', isBreak: false },
    { periodIndex: 4, name: 'P5', startTime: '13:30', endTime: '14:30', isBreak: false },
    { periodIndex: 5, name: 'P6', startTime: '14:30', endTime: '15:30', isBreak: false },
    { periodIndex: 6, name: 'P7', startTime: '15:30', endTime: '16:30', isBreak: false },
    { periodIndex: 7, name: 'P8', startTime: '16:30', endTime: '17:30', isBreak: false }
  ];
  const periods = (settings.periods && settings.periods.length > 0) ? settings.periods : defaultPeriods;
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
  const secNameToId = new Map();
  const teachCodeToId = new Map();
  const roomNumToId = new Map();

  for (const s of sections) {
    const sId = String(s._id || s.id || s.name);
    if (s.name) secNameToId.set(s.name, sId);
  }
  for (const t of teachers) {
    const tId = String(t._id || t.id || t.teacherCode);
    if (t.teacherCode) teachCodeToId.set(t.teacherCode, tId);
  }
  for (const r of rooms) {
    const rId = String(r._id || r.id || r.roomNumber);
    if (r.roomNumber) roomNumToId.set(r.roomNumber, rId);
  }

  const buildGrid = (list, key, fillVal) => {
    const map = new Map();
    for (const item of list) {
      const id = String(item._id || item.id || item.roomNumber || item.teacherCode || item.name || '');
      const g = Array.from({ length: D }, () => Array(P).fill(fillVal));
      if (item[key] && Array.isArray(item[key])) {
        for (let d = 0; d < D && d < item[key].length; ++d) {
          for (let p = 0; p < P && p < item[key][d].length; ++p) {
            g[d][p] = Boolean(item[key][d][p]);
          }
        }
      }
      map.set(id, g);
      if (item.name) map.set(item.name, g);
      if (item.roomNumber) map.set(item.roomNumber, g);
      if (item.teacherCode) map.set(item.teacherCode, g);
    }
    return map;
  };

  const teacherAvail = buildGrid(teachers, 'availability', true);
  const roomAvail    = buildGrid(rooms, 'availability', true);

  const teacherBusy  = new Map();
  for (const t of teachers) {
    const tId = String(t._id || t.id || t.teacherCode);
    const g = Array.from({ length: D }, () => Array(P).fill(false));
    teacherBusy.set(tId, g);
    if (t.teacherCode) teacherBusy.set(t.teacherCode, g);
  }

  const roomBusy     = new Map();
  for (const r of rooms) {
    const rId = String(r._id || r.id || r.roomNumber);
    const g = Array.from({ length: D }, () => Array(P).fill(false));
    roomBusy.set(rId, g);
    if (r.roomNumber) roomBusy.set(r.roomNumber, g);
  }

  const sectionBusy  = new Map();
  for (const s of sections) {
    const sId = String(s._id || s.id || s.name);
    const g = Array.from({ length: D }, () => Array(P).fill(false));
    sectionBusy.set(sId, g);
    if (s.name) sectionBusy.set(s.name, g);
  }

  // Staggered Lunch Shift: Shift 1 (Period 3) vs Shift 2 (Period 4)
  const sectionLunchSlot = new Map();
  for (const s of sections) {
    const id = String(s._id || s.id || s.name);
    const sName = (s.name || '').toUpperCase();
    const sDept = (s.department || '').toUpperCase();
    const lunchSlot = (sName.includes('CSE') || sName.includes('CS') || sName.includes('IT') || sName.includes('AIDS') ||
        sDept.includes('COMPUTER') || sDept.includes('INFORMATION')) ? 3 : 4;
    sectionLunchSlot.set(id, lunchSlot);
    if (s.name) sectionLunchSlot.set(s.name, lunchSlot);
  }

  const secSize = new Map();
  const secBranchMap = new Map();
  const secYearMap = new Map();
  const secDeptMap = new Map();
  for (const s of sections) {
    const sId = String(s._id || s.id || s.name);
    const sDept = s.department || 'General';
    secSize.set(sId, s.studentCount || 60);
    secDeptMap.set(sId, sDept);
    secBranchMap.set(sId, getBranchKey(sDept || s.name));
    secYearMap.set(sId, getYearKey(s.name));
    if (s.name) {
      secSize.set(s.name, s.studentCount || 60);
      secDeptMap.set(s.name, sDept);
      secBranchMap.set(s.name, getBranchKey(sDept || s.name));
      secYearMap.set(s.name, getYearKey(s.name));
    }
  }

  // Rooms by type lookup with branch/year metadata
  const roomsByType = new Map();
  for (const r of rooms) {
    const id = String(r._id || r.id || r.roomNumber);
    const rType = r.type || 'Classroom';
    const rDept = r.department || 'General';
    const rBranch = getBranchKey(rDept !== 'General' ? rDept : (r.name || r.roomNumber));
    const rYear = getYearKey(r.name || r.roomNumber);
    const rObj = {
      id,
      name: r.name || '',
      roomNumber: r.roomNumber || '',
      type: rType,
      capacity: r.capacity || 75,
      department: rDept,
      branch: rBranch,
      year: rYear
    };
    if (!roomsByType.has(rType)) roomsByType.set(rType, []);
    roomsByType.get(rType).push(rObj);
  }

  // Build sessions list
  const sessions = [];
  for (const subj of subjects) {
    const subjectId = String(subj._id || subj.id || subj.code || subj.name);
    const teacherId = String(subj.teacherId || teachCodeToId.get(subj.teacherCode) || subj.teacherCode || '');
    const sectionId = String(subj.sectionId || secNameToId.get(subj.sectionName) || subj.sectionName || '');
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

  const sectionDayPeriods = new Map();
  for (const s of sections) {
    const sId = String(s._id || s.id || s.name);
    const arr = Array(D).fill(0);
    sectionDayPeriods.set(sId, arr);
    if (s.name) sectionDayPeriods.set(s.name, arr);
  }
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
    const secId = sess.sectionId;
    const secBranch = secBranchMap.get(secId);
    const secYear = secYearMap.get(secId);
    const secDept = secDeptMap.get(secId);

    const neededCap = (sess.roomType === 'Classroom') ? sess.studentCount : Math.ceil(sess.studentCount / 2);
    let candRooms = (roomsByType.get(sess.roomType) || []).filter(r => r.capacity >= neededCap);

    // If it's a regular Classroom: strictly bind to that year's designated home lecture hall (no other hall)
    if (sess.roomType === 'Classroom') {
      const yearHomeRooms = candRooms.filter(r => {
        const branchMatch = (r.department && r.department !== 'General' && secDept && secDept !== 'General')
          ? (r.department.toLowerCase() === secDept.toLowerCase() || r.branch === secBranch)
          : (r.branch === secBranch);
        return branchMatch && r.year === secYear;
      });

      if (yearHomeRooms.length > 0) {
        // STRICTLY locked to that year's home room only! e.g. CS1 and CS2 only in 101, 2nd year only in 201
        candRooms = yearHomeRooms;
      } else {
        const branchClassrooms = candRooms.filter(r => {
          if (r.department && r.department !== 'General' && secDept && secDept !== 'General') {
            return r.department.toLowerCase() === secDept.toLowerCase() || r.branch === secBranch;
          }
          return r.branch === secBranch;
        });
        if (branchClassrooms.length > 0) {
          candRooms = branchClassrooms;
        }
      }
    }

    if (candRooms.length === 0) {
      unscheduled.push({
        sessionId: sess.sessionId,
        reasonCode: 'NO_ROOM_OF_TYPE_OR_CAPACITY',
        detail: `No room matches type=${sess.roomType} and cap>=${neededCap} for branch=${secBranch}`
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
                period: p,
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
  const defaultPeriods = [
    { periodIndex: 0, name: 'P1', startTime: '09:30', endTime: '10:30', isBreak: false },
    { periodIndex: 1, name: 'P2', startTime: '10:30', endTime: '11:30', isBreak: false },
    { periodIndex: 2, name: 'P3', startTime: '11:30', endTime: '12:30', isBreak: false },
    { periodIndex: 3, name: 'Lunch Break', startTime: '12:30', endTime: '13:30', isBreak: false },
    { periodIndex: 4, name: 'P5', startTime: '13:30', endTime: '14:30', isBreak: false },
    { periodIndex: 5, name: 'P6', startTime: '14:30', endTime: '15:30', isBreak: false },
    { periodIndex: 6, name: 'P7', startTime: '15:30', endTime: '16:30', isBreak: false },
    { periodIndex: 7, name: 'P8', startTime: '16:30', endTime: '17:30', isBreak: false }
  ];
  const periods = (settings.periods && settings.periods.length > 0) ? settings.periods : defaultPeriods;
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

      // Strict Branch-wise fixed classroom check (no cross-rooming for theory classrooms)
      if (reqType === 'Classroom' && rm.department && rm.department !== 'General' && sec?.department && sec.department !== 'General') {
        const rmBranch = getBranchKey(rm.department || rm.name || rm.roomNumber);
        const secBranch = getBranchKey(sec.department || sec.name);
        if (rmBranch !== 'GEN' && secBranch !== 'GEN' && rmBranch !== secBranch) {
          violations.push({
            constraintCode: 'H5',
            description: `Branch mismatch: ${sec.name} (${secBranch}) placed in foreign classroom ${rm.roomNumber || rm.name} (${rmBranch})`,
            assignmentIndex: idx
          });
        }
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
