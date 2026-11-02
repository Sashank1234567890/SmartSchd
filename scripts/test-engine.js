const { runEngine, verifyBinaryExists } = require('../server/services/engineRunner');

async function testEngine() {
  console.log('--- C++17 Engine Tests ---');
  if (!verifyBinaryExists('scheduler')) {
    throw new Error('Scheduler binary is missing. Run npm run build:engine first.');
  }
  if (!verifyBinaryExists('validator')) {
    throw new Error('Validator binary is missing. Run npm run build:engine first.');
  }

  // 1. Basic Scheduler Contract
  const schedInput = {
    mode: 'schedule',
    algorithm: 'greedy',
    params: {},
    settings: {
      workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      periods: [
        { index: 0, label: 'P1', start: '09:00', end: '09:50', isBreak: false },
        { index: 1, label: 'P2', start: '10:00', end: '10:50', isBreak: false }
      ]
    },
    sections: [{ _id: 'sec1', name: 'CS-A', studentCount: 60 }],
    teachers: [{ _id: 't1', name: 'Prof. Rao', maxWeeklyPeriods: 18, availability: Array(5).fill([true, true]) }],
    rooms: [{ _id: 'r1', name: 'LH-101', type: 'Classroom', capacity: 70, availability: Array(5).fill([true, true]) }],
    subjects: [{ _id: 'sub1', code: 'CS201', name: 'Data Structures', sectionId: 'sec1', teacherId: 't1', weeklyPeriods: 2, durationPeriods: 1, type: 'Theory', requiredRoomType: 'Classroom' }]
  };

  const schedRes = await runEngine('scheduler', schedInput);
  if (!schedRes.ok) {
    throw new Error('Scheduler returned ok=false: ' + JSON.stringify(schedRes));
  }
  console.log('✓ Scheduler CLI contract verified (mode: schedule).');

  // 2. Basic Validator Contract
  const valInput = {
    ...schedInput,
    mode: 'validate',
    assignments: schedRes.assignments,
    unscheduled: schedRes.unscheduled
  };

  const valRes = await runEngine('validator', valInput);
  if (!valRes.ok || !valRes.validationStatus) {
    throw new Error('Validator returned invalid payload: ' + JSON.stringify(valRes));
  }
  console.log('✓ Validator CLI contract verified (mode: validate).');

  // 3. Error handling on malformed mode
  try {
    await runEngine('scheduler', { ...schedInput, mode: 'unknown' });
    throw new Error('Expected scheduler to reject invalid mode');
  } catch (err) {
    if (err.code === 'E_INVALID_MODE' || err.details?.parsedError?.error?.code === 'E_INVALID_MODE' || err.code === 'E_ENGINE_EXIT_NONZERO') {
      console.log('✓ Scheduler gracefully rejected invalid mode.');
    } else {
      throw err;
    }
  }

  console.log('All engine tests passed cleanly!');
}

testEngine().catch(err => {
  console.error('test:engine FAILED:', err);
  process.exit(1);
});
