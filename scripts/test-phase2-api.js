const http = require('http');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { startServer } = require('../server/index');

function request(port, method, path, body = null) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : null;
    const req = http.request({
      hostname: 'localhost',
      port,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(postData ? { 'Content-Length': Buffer.byteLength(postData) } : {})
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = JSON.parse(data);
        } catch (_) {
          parsed = data;
        }
        resolve({ status: res.statusCode, data: parsed });
      });
    });

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function runApiTests() {
  console.log('--- Phase 2 REST API Comprehensive End-to-End Tests ---');
  const server = await startServer();
  const port = process.env.PORT || 3001;

  try {
    // 1. GET /api/settings
    const setRes = await request(port, 'GET', '/api/settings');
    console.log(`1. GET /api/settings -> Status: ${setRes.status}, Days: ${setRes.data.data.workingDays.length}`);
    if (setRes.status !== 200) throw new Error('GET /api/settings failed');

    // 2. POST /api/sections
    const secRes = await request(port, 'POST', '/api/sections', {
      name: 'SEC_E2E_1',
      department: 'CSE',
      studentCount: 50
    });
    console.log(`2. POST /api/sections -> Status: ${secRes.status}, Section ID: ${secRes.data.data?._id}`);
    if (secRes.status !== 201) throw new Error('POST /api/sections failed: ' + JSON.stringify(secRes.data));
    const sectionId = secRes.data.data._id;

    // 3. POST /api/rooms
    const roomRes = await request(port, 'POST', '/api/rooms', {
      name: 'Room E2E',
      roomNumber: 'R_E2E_1',
      type: 'Classroom',
      capacity: 60
    });
    console.log(`3. POST /api/rooms -> Status: ${roomRes.status}, Room ID: ${roomRes.data.data?._id}`);
    if (roomRes.status !== 201) throw new Error('POST /api/rooms failed: ' + JSON.stringify(roomRes.data));
    const roomId = roomRes.data.data._id;

    // 4. POST /api/teachers
    const teachRes = await request(port, 'POST', '/api/teachers', {
      name: 'Prof. E2E',
      teacherCode: 'T_E2E_1',
      teachableSubjectCodes: ['CS_OK_1'],
      maxWeeklyPeriods: 16
    });
    console.log(`4. POST /api/teachers -> Status: ${teachRes.status}, Teacher ID: ${teachRes.data.data?._id}`);
    if (teachRes.status !== 201) throw new Error('POST /api/teachers failed: ' + JSON.stringify(teachRes.data));
    const teacherId = teachRes.data.data._id;

    // 5. POST /api/subjects with unqualified teacher -> Expect 422 E_TEACHER_NOT_QUALIFIED
    const subUnqualRes = await request(port, 'POST', '/api/subjects', {
      name: 'Unqualified Course',
      code: 'CS_UNQUAL_1',
      type: 'Theory',
      sectionId,
      teacherId,
      weeklySessions: 3,
      durationPeriods: 1
    });
    console.log(`5. POST /api/subjects (Unqualified teacher) -> Status: ${subUnqualRes.status}, Code: ${subUnqualRes.data.error?.code}`);
    if (subUnqualRes.status !== 422 || subUnqualRes.data.error?.code !== 'E_TEACHER_NOT_QUALIFIED') {
      throw new Error('Expected 422 E_TEACHER_NOT_QUALIFIED, got: ' + JSON.stringify(subUnqualRes));
    }

    // 6. POST /api/subjects with qualified teacher -> Expect 201
    const subQualRes = await request(port, 'POST', '/api/subjects', {
      name: 'Algorithms Course',
      code: 'CS_OK_1',
      type: 'Theory',
      sectionId,
      teacherId,
      weeklySessions: 3,
      durationPeriods: 1
    });
    console.log(`6. POST /api/subjects (Qualified teacher) -> Status: ${subQualRes.status}, Subject ID: ${subQualRes.data.data?._id}`);
    if (subQualRes.status !== 201) throw new Error('POST /api/subjects failed: ' + JSON.stringify(subQualRes.data));
    const subjectId = subQualRes.data.data._id;

    // 7. POST /api/subjects duplicate check -> Expect 400 E_DUPLICATE_SUBJECT
    const subDupRes = await request(port, 'POST', '/api/subjects', {
      name: 'Algorithms Duplicate',
      code: 'CS_OK_1',
      type: 'Theory',
      sectionId,
      teacherId,
      weeklySessions: 3,
      durationPeriods: 1
    });
    console.log(`7. POST /api/subjects (Duplicate code for section) -> Status: ${subDupRes.status}, Code: ${subDupRes.data.error?.code}`);
    if (subDupRes.status !== 400 || subDupRes.data.error?.code !== 'E_DUPLICATE_SUBJECT') {
      throw new Error('Expected 400 E_DUPLICATE_SUBJECT, got: ' + JSON.stringify(subDupRes));
    }

    // 8. DELETE /api/teachers/:id -> Expect 409 E_REFERENCED_RESOURCE
    const delTeachRes = await request(port, 'DELETE', `/api/teachers/${teacherId}`);
    console.log(`8. DELETE /api/teachers (Referenced by subject) -> Status: ${delTeachRes.status}, Code: ${delTeachRes.data.error?.code}`);
    if (delTeachRes.status !== 409 || delTeachRes.data.error?.code !== 'E_REFERENCED_RESOURCE') {
      throw new Error('Expected 409 E_REFERENCED_RESOURCE on teacher delete, got: ' + JSON.stringify(delTeachRes));
    }

    // 9. DELETE /api/sections/:id -> Expect 409 E_REFERENCED_RESOURCE
    const delSecRes = await request(port, 'DELETE', `/api/sections/${sectionId}`);
    console.log(`9. DELETE /api/sections (Referenced by subject) -> Status: ${delSecRes.status}, Code: ${delSecRes.data.error?.code}`);
    if (delSecRes.status !== 409 || delSecRes.data.error?.code !== 'E_REFERENCED_RESOURCE') {
      throw new Error('Expected 409 E_REFERENCED_RESOURCE on section delete, got: ' + JSON.stringify(delSecRes));
    }

    // 10. POST /api/validate/preflight
    const pfRes = await request(port, 'POST', '/api/validate/preflight', {
      sectionIds: [sectionId]
    });
    console.log(`10. POST /api/validate/preflight -> Status: ${pfRes.status}, Valid: ${pfRes.data.data?.isValid}`);
    if (pfRes.status !== 200 || !pfRes.data.data?.isValid) {
      throw new Error('Preflight validation failed: ' + JSON.stringify(pfRes.data));
    }

    // Cleanup: Delete Subject, then Teacher, then Section, then Room
    await request(port, 'DELETE', `/api/subjects/${subjectId}`);
    await request(port, 'DELETE', `/api/teachers/${teacherId}`);
    await request(port, 'DELETE', `/api/sections/${sectionId}`);
    await request(port, 'DELETE', `/api/rooms/${roomId}`);
    console.log('✓ Cleanup completed cleanly.');

    console.log('All Phase 2 End-to-End REST tests PASSED cleanly!');
  } finally {
    server.close();
    const mongoose = require('mongoose');
    await mongoose.disconnect();
    process.exit(0);
  }
}

runApiTests().catch(err => {
  console.error('API Test Error:', err);
  process.exit(1);
});
