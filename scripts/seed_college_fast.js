const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const Section = require('../server/models/Section');
const Room = require('../server/models/Room');
const Teacher = require('../server/models/Teacher');
const Subject = require('../server/models/Subject');
const Settings = require('../server/models/Settings');

async function main() {
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB connected successfully.');

  const seedPath = path.resolve(__dirname, '../server/seeds/college.json');
  const rawData = JSON.parse(fs.readFileSync(seedPath, 'utf8'));

  const settingsDoc = await Settings.getSingleton();
  const D = settingsDoc.workingDays.length;
  const P = settingsDoc.periods.length;
  const defaultMatrix = Array.from({ length: D }, () => Array(P).fill(true));

  console.log('Clearing old college data (Subject, Teacher, Room, Section)...');
  await Subject.deleteMany({});
  await Teacher.deleteMany({});
  await Room.deleteMany({});
  await Section.deleteMany({});

  console.log('Inserting 60 sections...');
  const secDocs = rawData.sections.map(s => ({
    name: s.name.trim(),
    department: s.department || 'General',
    studentCount: parseInt(s.studentCount, 10) || 60
  }));
  const createdSections = await Section.insertMany(secDocs);
  const sectionMap = new Map();
  createdSections.forEach(s => sectionMap.set(s.name.toUpperCase(), s._id));

  console.log(`Inserting ${rawData.rooms.length} reduced rooms...`);
  const roomDocs = rawData.rooms.map(r => ({
    name: r.name || `Room ${r.roomNumber}`,
    roomNumber: r.roomNumber.trim(),
    type: r.type,
    capacity: parseInt(r.capacity, 10) || 75,
    availability: defaultMatrix
  }));
  await Room.insertMany(roomDocs);

  console.log('Inserting 94 teachers...');
  const teacherDocs = rawData.teachers.map(t => ({
    name: t.name,
    teacherCode: t.teacherCode.trim().toUpperCase(),
    department: t.department || 'General',
    teachableSubjectCodes: t.teachableSubjectCodes || [],
    maxWeeklyPeriods: parseInt(t.maxWeeklyPeriods, 10) || 24,
    availability: defaultMatrix,
    preferredSlots: []
  }));
  const createdTeachers = await Teacher.insertMany(teacherDocs);
  const teacherMap = new Map();
  createdTeachers.forEach(t => teacherMap.set(t.teacherCode.toUpperCase(), t._id));

  console.log(`Inserting ${rawData.subjects.length} subjects (min 5 per section)...`);
  const subDocs = rawData.subjects.map(sub => {
    const sName = (sub.sectionName || '').toUpperCase();
    const tCode = (sub.teacherCode || '').toUpperCase();
    return {
      name: sub.name,
      code: sub.code.trim().toUpperCase(),
      type: sub.type,
      sectionId: sectionMap.get(sName),
      teacherId: teacherMap.get(tCode),
      weeklySessions: parseInt(sub.weeklySessions, 10) || 3,
      durationPeriods: parseInt(sub.durationPeriods, 10) || 1,
      requiredRoomType: sub.requiredRoomType || 'Classroom'
    };
  });
  await Subject.insertMany(subDocs);

  console.log('SEEDED SUCCESSFULLY:');
  console.log(`- Sections: ${createdSections.length}`);
  console.log(`- Rooms: ${roomDocs.length}`);
  console.log(`- Teachers: ${createdTeachers.length}`);
  console.log(`- Subjects: ${subDocs.length}`);

  process.exit(0);
}

main().catch(err => {
  console.error('Seed Error:', err);
  process.exit(1);
});
