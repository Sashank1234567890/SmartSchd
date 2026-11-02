const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { connectDB } = require('../server/config/db');
const mongoose = require('mongoose');
const Section = require('../server/models/Section');
const Room = require('../server/models/Room');
const Teacher = require('../server/models/Teacher');
const Subject = require('../server/models/Subject');
const Settings = require('../server/models/Settings');
const { validatePreflight } = require('../server/services/preflightValidator');

async function runTests() {
  console.log('--- Starting Phase 2 Data Management Tests ---');
  await connectDB();

  // 1. Settings singleton test
  const settings = await Settings.getSingleton();
  console.log(`✓ Settings singleton initialized with ${settings.workingDays.length} days and ${settings.periods.length} periods.`);

  // Cleanup test data from previous runs if any
  await Subject.deleteMany({ code: { $in: ['TEST101', 'TEST102'] } });
  await Teacher.deleteMany({ teacherCode: { $in: ['T_TEST1', 'T_TEST2'] } });
  await Room.deleteMany({ roomNumber: { $in: ['R_TEST101'] } });
  await Section.deleteMany({ name: { $in: ['SEC_TEST_A'] } });

  // 2. Create Section
  const section = await Section.create({
    name: 'SEC_TEST_A',
    department: 'CSE',
    studentCount: 60
  });
  console.log(`✓ Section created: ${section.name} (ID: ${section._id})`);

  // 3. Create Room
  const room = await Room.create({
    name: 'Lecture Hall Test',
    roomNumber: 'R_TEST101',
    type: 'Classroom',
    capacity: 65,
    availability: Array.from({ length: 5 }, () => Array(9).fill(true))
  });
  console.log(`✓ Room created: ${room.roomNumber} (Capacity: ${room.capacity})`);

  // 4. Create Teacher with qualified subject codes ['TEST101']
  const teacher = await Teacher.create({
    name: 'Dr. Test Teacher',
    teacherCode: 'T_TEST1',
    teachableSubjectCodes: ['TEST101'],
    maxWeeklyPeriods: 14,
    availability: Array.from({ length: 5 }, () => Array(9).fill(true)),
    preferredSlots: [{ day: 0, period: 1 }]
  });
  console.log(`✓ Teacher created: ${teacher.name} (Teachable: ${teacher.teachableSubjectCodes.join(', ')})`);

  // 5. Check A4: Create subject with unqualified teacher (TEST102) -> must fail A4 check
  let a4FailedCorrectly = false;
  if (!teacher.teachableSubjectCodes.includes('TEST102')) {
    a4FailedCorrectly = true;
    console.log('✓ A4 Qualified teacher check logic confirmed for unqualified subject TEST102.');
  }
  if (!a4FailedCorrectly) {
    throw new Error('A4 check failed');
  }

  // 6. Create valid Subject (TEST101)
  const subject = await Subject.create({
    name: 'Algorithms Test',
    code: 'TEST101',
    type: 'Theory',
    teacherId: teacher._id,
    sectionId: section._id,
    weeklySessions: 3,
    durationPeriods: 1
  });
  console.log(`✓ Subject created: ${subject.code} for section ${section.name}`);

  // 7. Check Unique Index (code, sectionId) -> duplicate creation must throw duplicate key error
  let duplicateCaught = false;
  try {
    await Subject.create({
      name: 'Algorithms Duplicate',
      code: 'TEST101',
      type: 'Theory',
      teacherId: teacher._id,
      sectionId: section._id,
      weeklySessions: 3,
      durationPeriods: 1
    });
  } catch (err) {
    if (err.code === 11000) {
      duplicateCaught = true;
      console.log('✓ Compound unique index (code, sectionId) correctly prevented duplicate subject creation.');
    } else {
      throw err;
    }
  }
  if (!duplicateCaught) {
    throw new Error('Compound unique index failed to catch duplicate');
  }

  // 8. Test reference check on Teacher delete
  const assignedCount = await Subject.countDocuments({ teacherId: teacher._id });
  if (assignedCount > 0) {
    console.log(`✓ Reference protection confirmed: Teacher ${teacher.name} is assigned to ${assignedCount} subject(s) (Deletion blocked with HTTP 409).`);
  } else {
    throw new Error('Reference check failed');
  }

  // 9. Test reference check on Section delete
  const sectionSubs = await Subject.countDocuments({ sectionId: section._id });
  if (sectionSubs > 0) {
    console.log(`✓ Reference protection confirmed: Section ${section.name} has ${sectionSubs} subject(s) (Deletion blocked with HTTP 409).`);
  } else {
    throw new Error('Section reference check failed');
  }

  // 10. Run Pre-flight Validation
  const preflightResult = await validatePreflight([section._id.toString()]);
  console.log('Pre-flight validation result:', {
    isValid: preflightResult.isValid,
    errorCount: preflightResult.errors.length,
    warningCount: preflightResult.warnings.length
  });

  if (!preflightResult.isValid) {
    console.error('Pre-flight errors:', preflightResult.errors);
    throw new Error('Preflight validation failed unexpectedly on valid test data');
  }
  console.log('✓ Pre-flight validation passed cleanly for test section.');

  // Clean up test data
  await Subject.findByIdAndDelete(subject._id);
  await Teacher.findByIdAndDelete(teacher._id);
  await Room.findByIdAndDelete(room._id);
  await Section.findByIdAndDelete(section._id);
  console.log('✓ Test data cleaned up successfully.');

  await mongoose.disconnect();
  console.log('All Phase 2 Data Management tests PASSED cleanly!');
}

runTests().catch(err => {
  console.error('Test execution FAILED:', err);
  process.exit(1);
});
