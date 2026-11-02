/**
 * SmartSched University Automated Benchmark Suite
 * Evaluates Greedy, Backtracking (MRV + Forward Checking), and Graph Coloring (DSATUR)
 * across University-scale datasets and verifies constraints via the independent C++ validator binary.
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { runEngine, verifyBinaryExists } = require('../server/services/engineRunner');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const ALGORITHMS = ['greedy', 'backtracking', 'graph-coloring'];

function ensureIds(raw) {
  const clone = JSON.parse(JSON.stringify(raw));
  let counter = 1;
  const secMap = new Map();
  const teaMap = new Map();

  clone.sections = (clone.sections || []).map(s => {
    const id = s._id ? String(s._id) : (s.id || `sec_${counter++}`);
    secMap.set(s.name, id);
    return { ...s, _id: id, id, studentCount: s.studentCount || 60 };
  });

  clone.teachers = (clone.teachers || []).map(t => {
    const id = t._id ? String(t._id) : (t.id || `tea_${counter++}`);
    teaMap.set(t.name, id);
    if (t.teacherCode) teaMap.set(t.teacherCode, id);
    return { 
      ...t, 
      _id: id, 
      id, 
      maxWeeklyPeriods: t.maxWeeklyPeriods || 24,
      availability: t.availability || Array(5).fill(Array(8).fill(true)) 
    };
  });

  clone.rooms = (clone.rooms || []).map(r => {
    const id = r._id ? String(r._id) : (r.id || `rm_${counter++}`);
    return { 
      ...r, 
      _id: id, 
      id, 
      capacity: r.capacity || 70,
      type: r.type || 'Classroom',
      availability: r.availability || Array(5).fill(Array(8).fill(true)) 
    };
  });

  clone.subjects = (clone.subjects || []).map(sb => {
    const id = sb._id ? String(sb._id) : (sb.id || `sb_${counter++}`);
    const sectionId = sb.sectionId ? String(sb.sectionId) : (secMap.get(sb.sectionName) || clone.sections[0]?._id);
    const teacherId = sb.teacherId ? String(sb.teacherId) : (teaMap.get(sb.teacherName) || clone.teachers[0]?._id);
    const isLab = sb.type === 'Lab' || (sb.durationPeriods === 2 && sb.code !== 'SPORTS');
    const isSports = sb.code === 'SPORTS';

    return {
      ...sb,
      _id: id,
      id,
      sectionId,
      teacherId,
      weeklyPeriods: sb.weeklyPeriods || 3,
      durationPeriods: sb.durationPeriods || (isLab || isSports ? 2 : 1),
      requiredRoomType: sb.requiredRoomType || (isSports ? 'SportsGround' : isLab ? 'ComputerLab' : 'Classroom')
    };
  });

  if (!clone.settings) {
    clone.settings = {
      workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      periods: Array(8).fill(null).map((_, i) => ({ label: `Period ${i+1}`, isBreak: false }))
    };
  } else {
    if (!clone.settings.workingDays) clone.settings.workingDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    if (!clone.settings.periods) clone.settings.periods = Array(8).fill(null).map((_, i) => ({ label: `Period ${i+1}`, isBreak: false }));
  }

  return clone;
}

async function runBenchmark() {
  console.log('\n========================================================================================');
  console.log('   SMARTSCHED UNIVERSITY ALGORITHM BENCHMARK SUITE');
  console.log('   Course: DAA CSBB 202 &bull; NIT Delhi');
  console.log('   Comparing Greedy vs Backtracking (MRV + FC) vs Graph-Coloring (DSATUR)');
  console.log('========================================================================================\n');

  // 1. Verify Binaries
  const binaries = ['scheduler', 'backtracking', 'graph-coloring', 'validator'];
  for (const b of binaries) {
    if (!verifyBinaryExists(b)) {
      console.error(`Missing binary: ${b}. Run: npm run build:engine`);
      process.exit(1);
    }
  }

  // 2. Load Datasets
  const datasets = [];

  // Try loading live University database from MongoDB Atlas
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (mongoUri) {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
      const Settings = require('../server/models/Settings');
      const Section = require('../server/models/Section');
      const Teacher = require('../server/models/Teacher');
      const Room = require('../server/models/Room');
      const Subject = require('../server/models/Subject');

      const [settings, sections, teachers, rooms, subjects] = await Promise.all([
        Settings.getSingleton(),
        Section.find().lean(),
        Teacher.find().lean(),
        Room.find().lean(),
        Subject.find().lean()
      ]);

      if (sections.length > 0 && subjects.length > 0) {
        datasets.push({
          name: `Live College (${sections.length} batches, ${rooms.length} rooms, ${teachers.length} faculty)`,
          data: {
            settings,
            sections: sections.map(s => ({ ...s, _id: s._id.toString() })),
            teachers: teachers.map(t => ({ ...t, _id: t._id.toString() })),
            rooms: rooms.map(r => ({ ...r, _id: r._id.toString() })),
            subjects: subjects.map(sb => ({ 
              ...sb, 
              _id: sb._id.toString(),
              sectionId: sb.sectionId.toString(),
              teacherId: sb.teacherId.toString()
            }))
          }
        });
      }
      await mongoose.disconnect();
    }
  } catch (err) {
    console.log('Note: MongoDB Atlas live connect skipped or offline, using seed files.');
  }

  // Also include synthetic small/medium/large templates
  const seedsDir = path.resolve(__dirname, '../server/seeds');
  const fileNames = ['small.json', 'medium.json', 'large.json'];
  for (const fn of fileNames) {
    const fp = path.join(seedsDir, fn);
    if (fs.existsSync(fp)) {
      const raw = JSON.parse(fs.readFileSync(fp, 'utf8'));
      datasets.push({
        name: fn.replace('.json', '').toUpperCase(),
        data: ensureIds(raw)
      });
    }
  }

  const results = [];

  for (const ds of datasets) {
    const { settings, sections, teachers, rooms, subjects } = ds.data;
    console.log(`\n── Dataset: ${ds.name} ──`);
    console.log(`   Sections: ${sections.length} | Teachers: ${teachers.length} | Rooms: ${rooms.length} | Subjects: ${subjects.length}`);

    for (const algo of ALGORITHMS) {
      const binaryName = algo === 'backtracking' ? 'backtracking'
                       : algo === 'graph-coloring' ? 'graph-coloring'
                       : 'scheduler';

      const engineInput = {
        mode: 'schedule',
        algorithm: algo,
        params: { timeLimitMs: 30000, nodeLimit: 200000 },
        settings,
        sections,
        teachers,
        rooms,
        subjects
      };

      try {
        const t0 = process.hrtime.bigint();
        const schedRes = await runEngine(binaryName, engineInput);
        const t1 = process.hrtime.bigint();
        const elapsedMs = Number(t1 - t0) / 1e6;

        const scheduled = schedRes.assignments?.length || 0;
        const unscheduled = schedRes.unscheduled?.length || 0;
        const total = scheduled + unscheduled;
        const rate = total > 0 ? (scheduled / total * 100).toFixed(1) : '100.0';

        // Validate via independent validator binary
        const valInput = {
          ...engineInput,
          mode: 'validate',
          assignments: schedRes.assignments,
          unscheduled: schedRes.unscheduled
        };
        const valRes = await runEngine('validator', valInput);

        const runtimeMs = schedRes.metrics?.algorithmTimeMs || elapsedMs;
        const nodes = schedRes.metrics?.searchNodes ?? schedRes.metrics?.colorsUsed ?? '-';

        results.push({
          dataset: ds.name.split(' (')[0],
          algo,
          runtimeMs: runtimeMs.toFixed(2),
          total,
          scheduled,
          rate: `${rate}%`,
          nodes,
          status: valRes.validationStatus,
          violations: valRes.hardViolationsCount || valRes.violations?.length || 0
        });

        console.log(`   ✓ ${algo.padEnd(16)}: ${runtimeMs.toFixed(2).padStart(8)} ms | ${scheduled}/${total} placed (${rate}%) | ${valRes.validationStatus} (Violations: ${valRes.violations?.length || 0})`);
      } catch (err) {
        console.error(`   ✗ ${algo} failed:`, err.message);
      }
    }
  }

  // Summary Table
  console.log('\n====================================================================================================');
  console.log('                                  BENCHMARK SUMMARY MATRIX                                          ');
  console.log('====================================================================================================');
  console.log('Dataset         | Algorithm        | Runtime (ms) | Placed/Total | Rate    | Nodes/Col | Validator Status');
  console.log('----------------+------------------+--------------+--------------+---------+-----------+-----------------');

  for (const r of results) {
    console.log(
      `${r.dataset.padEnd(15)} | ${r.algo.padEnd(16)} | ${r.runtimeMs.padStart(12)} | ${(r.scheduled + '/' + r.total).padStart(12)} | ${r.rate.padStart(7)} | ${String(r.nodes).padStart(9)} | ${r.status} (${r.violations} viol)`
    );
  }
  console.log('====================================================================================================\n');
}

runBenchmark().catch(err => {
  console.error('Fatal benchmark error:', err);
  process.exit(1);
});
