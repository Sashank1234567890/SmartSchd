const { runEngine, verifyBinaryExists } = require('../server/services/engineRunner');

async function testRoundTrip() {
  console.log('Testing engineRunner round trip...');
  console.log('Scheduler binary exists:', verifyBinaryExists('scheduler'));
  console.log('Validator binary exists:', verifyBinaryExists('validator'));

  const schedulerInput = {
    mode: 'schedule',
    algorithm: 'greedy',
    params: {},
    settings: {
      days: ['Mon'],
      periods: [{ index: 0, label: 'P1', start: '09:00', end: '09:50', isBreak: false }],
      constraintConfig: { weights: { gaps: 1, workloadBalance: 1, consecutiveTeaching: 1, preferredSlots: 1, distribution: 1, earlyLate: 1 }, maxConsecutivePeriods: 3 }
    },
    sections: [{ id: 'sec1', name: 'CS-A', studentCount: 60 }],
    teachers: [{ id: 't1', name: 'Prof. Rao', maxWeeklyPeriods: 18, availability: [[true]], preferredSlots: [] }],
    rooms: [{ id: 'r1', name: 'LH-101', type: 'Classroom', capacity: 70, availability: [[true]] }],
    sessions: [{ sessionId: 'sess1', subjectId: 'sub1', subjectCode: 'CS201', sectionId: 'sec1', teacherId: 't1', durationPeriods: 1, roomType: 'Classroom' }]
  };

  const scheduleResult = await runEngine('scheduler', schedulerInput);
  console.log('Scheduler output:', JSON.stringify(scheduleResult));

  if (!scheduleResult.ok || scheduleResult.algorithm !== 'greedy') {
    throw new Error('Scheduler round trip failed contract check');
  }

  const validatorInput = {
    ...schedulerInput,
    mode: 'validate',
    assignments: scheduleResult.assignments,
    unscheduled: scheduleResult.unscheduled
  };

  const validateResult = await runEngine('validator', validatorInput);
  console.log('Validator output:', JSON.stringify(validateResult));

  if (!validateResult.ok || !validateResult.validationStatus) {
    throw new Error('Validator round trip failed contract check');
  }

  console.log('EngineRunner round trip test PASSED!');
}

testRoundTrip().catch(err => {
  console.error('Test FAILED:', err);
  process.exit(1);
});
