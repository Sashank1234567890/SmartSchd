const { runJsScheduler, runJsValidator } = require('../server/services/jsEngine');
const data = require('../server/seeds/preset_1_nit_delhi.json');

console.log('Testing JS Engine on NIT Delhi Preset...');
const sched = runJsScheduler(data, 'combined');
console.log('Scheduler result:');
console.log('  ok:', sched.ok);
console.log('  searchStatus:', sched.searchStatus);
console.log('  total assignments:', sched.assignments.length);
console.log('  unscheduled count:', sched.unscheduled ? sched.unscheduled.length : 0);

if (sched.unscheduled && sched.unscheduled.length > 0) {
  console.log('  Sample unscheduled:', sched.unscheduled.slice(0, 5));
}

const valInput = {
  ...data,
  assignments: sched.assignments,
  unscheduled: sched.unscheduled
};

const val = runJsValidator(valInput);
console.log('Validator result:');
console.log('  ok:', val.ok);
console.log('  validationStatus:', val.validationStatus);
console.log('  hardViolationsCount:', val.hardViolationsCount);
if (val.violations && val.violations.length > 0) {
  console.log('  Sample violations:', val.violations.slice(0, 5));
}

// Check interleaving of CS1 and CS2
const cs1Assignments = sched.assignments.filter(a => {
  const s = data.sections.find(sec => String(sec._id || sec.id) === String(a.sectionId));
  return s && s.name === 'CSE-1st-CS1';
});
const cs2Assignments = sched.assignments.filter(a => {
  const s = data.sections.find(sec => String(sec._id || sec.id) === String(a.sectionId));
  return s && s.name === 'CSE-1st-CS2';
});

console.log('\nInterleaving Check for CSE 1st Year:');
console.log('CS1 assignments count:', cs1Assignments.length);
console.log('CS2 assignments count:', cs2Assignments.length);

const cs1Rooms = new Set(cs1Assignments.map(a => {
  const r = data.rooms.find(rm => String(rm._id || rm.id) === String(a.roomId));
  return r ? r.roomNumber : a.roomId;
}));
const cs2Rooms = new Set(cs2Assignments.map(a => {
  const r = data.rooms.find(rm => String(rm._id || rm.id) === String(a.roomId));
  return r ? r.roomNumber : a.roomId;
}));

console.log('CS1 rooms used:', Array.from(cs1Rooms));
console.log('CS2 rooms used:', Array.from(cs2Rooms));

// Cross-rooming check across whole schedule
let crossRoomingViolations = 0;
for (const a of sched.assignments) {
  const sec = data.sections.find(s => String(s._id || s.id) === String(a.sectionId));
  const rm = data.rooms.find(r => String(r._id || r.id) === String(a.roomId));
  if (sec && rm && rm.type === 'Classroom' && rm.department !== 'General') {
    if (sec.department !== rm.department) {
      crossRoomingViolations++;
      console.log(`Cross-rooming detected: Section ${sec.name} (${sec.department}) in Room ${rm.roomNumber} (${rm.department})`);
    }
  }
}
console.log('Total cross-rooming classroom violations:', crossRoomingViolations);
