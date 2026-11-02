const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const mongoose = require('mongoose');
const { runEngine, verifyBinaryExists } = require('../services/engineRunner');
const { validatePreflight } = require('../services/preflightValidator');
const { computeSoftMetrics } = require('../services/softMetrics');

const Settings = require('../models/Settings');
const Section  = require('../models/Section');
const Teacher  = require('../models/Teacher');
const Room     = require('../models/Room');
const Subject  = require('../models/Subject');
const AlgorithmRun = require('../models/AlgorithmRun');
const Comparison   = require('../models/Comparison');

function envelope(success, data = null, error = null) {
  return { success, data, error };
}

async function prepareData(rawIds) {
  let sectionQuery = {};
  if (Array.isArray(rawIds) && rawIds.length > 0) {
    sectionQuery = { _id: { $in: rawIds } };
  }

  const [settings, sections, teachers, rooms] = await Promise.all([
    Settings.getSingleton(),
    Section.find(sectionQuery).lean(),
    Teacher.find().lean(),
    Room.find().lean()
  ]);

  if (sections.length === 0) {
    throw new Error('No sections found to schedule');
  }

  const sectionIds = sections.map(s => s._id);
  const subjects = await Subject.find({ sectionId: { $in: sectionIds } }).lean();

  const pre = await validatePreflight(sectionIds);
  if (!pre.isValid) {
    throw new Error(`Preflight validation failed: ${pre.errors.map(e => e.message).join('; ')}`);
  }

  return { settings, sections, teachers, rooms, subjects, sectionIds };
}

/**
 * GET /api/generate/comparisons
 * List past comparison benchmark runs
 */
router.get('/comparisons', async (req, res) => {
  try {
    const list = await Comparison.find().sort({ createdAt: -1 }).limit(20).lean();
    return res.json(envelope(true, list));
  } catch (err) {
    return res.status(500).json(envelope(false, null, { code: 'E_INTERNAL', message: err.message }));
  }
});

/**
 * POST /api/generate/compare
 * Runs Greedy, Backtracking, and Graph Coloring sequentially on the same dataset
 */
router.post('/compare', async (req, res) => {
  try {
    const { sectionIds: rawIds, params } = req.body || {};
    const { settings, sections, teachers, rooms, subjects, sectionIds } = await prepareData(rawIds);

    const algorithms = ['greedy', 'backtracking', 'graph-coloring', 'combined'];
    const comparisonResults = [];
    const comparisonDocId = new mongoose.Types.ObjectId();

    for (const algo of algorithms) {
      const binaryName = algo === 'backtracking' ? 'backtracking'
                       : algo === 'graph-coloring' ? 'graph-coloring'
                       : (algo === 'combined' || algo === 'hybrid') ? 'combined'
                       : 'scheduler';

      if (!verifyBinaryExists(binaryName)) {
        throw new Error(`${binaryName} binary not found. Run npm run build:engine`);
      }

      const engineInput = {
        mode: 'schedule',
        algorithm: algo,
        params: params || {},
        settings,
        sections,
        teachers,
        rooms,
        subjects
      };

      const inputHash = crypto
        .createHash('sha256')
        .update(JSON.stringify(engineInput))
        .digest('hex');

      const scheduleResult = await runEngine(binaryName, engineInput);

      // Run validator binary
      const validatorInput = {
        ...engineInput,
        mode: 'validate',
        assignments: scheduleResult.assignments,
        unscheduled: scheduleResult.unscheduled
      };
      const validationResult = await runEngine('validator', validatorInput);

      const softMetrics = computeSoftMetrics(scheduleResult.assignments, {
        sections,
        teachers,
        subjects,
        numDays: settings.workingDays ? settings.workingDays.length : 5
      });

      const algoRun = await AlgorithmRun.create({
        algorithm: algo,
        parameters: params || {},
        inputHash,
        engineStatus: scheduleResult.searchStatus || 'UNKNOWN',
        metrics: scheduleResult.metrics,
        validationStatus: validationResult.validationStatus,
        assignments: scheduleResult.assignments || [],
        unscheduled: scheduleResult.unscheduled || [],
        comparisonId: comparisonDocId,
        createdAt: new Date()
      });

      const scheduledCount = scheduleResult.assignments?.length || 0;
      const unscheduledCount = scheduleResult.unscheduled?.length || 0;
      const totalCount = scheduledCount + unscheduledCount;
      const completionRate = totalCount > 0 ? (scheduledCount / totalCount) * 100 : 0;

      comparisonResults.push({
        algorithm: algo,
        algorithmRunId: algoRun._id,
        runtimeMs: scheduleResult.metrics?.algorithmTimeMs || 0,
        scheduledCount,
        unscheduledCount,
        completionRate: Math.round(completionRate * 10) / 10,
        searchNodes: scheduleResult.metrics?.searchNodes ?? null,
        backtracks: scheduleResult.metrics?.backtrackCount ?? null,
        colorsUsed: scheduleResult.metrics?.colorsUsed ?? null,
        validationStatus: validationResult.validationStatus,
        hardViolationsCount: validationResult.violations?.length || 0,
        softMetrics,
        assignments: scheduleResult.assignments,
        unscheduled: scheduleResult.unscheduled
      });
    }

    // Determine winners
    let fastest = comparisonResults[0].algorithm;
    let minTime = comparisonResults[0].runtimeMs;
    let highestCompletion = comparisonResults[0].algorithm;
    let maxCompletion = comparisonResults[0].completionRate;
    let bestDist = comparisonResults[0].algorithm;
    let minPenalty = 999999;

    for (const r of comparisonResults) {
      if (r.runtimeMs < minTime) {
        minTime = r.runtimeMs;
        fastest = r.algorithm;
      }
      if (r.completionRate > maxCompletion) {
        maxCompletion = r.completionRate;
        highestCompletion = r.algorithm;
      }
      // Penalty: same subject same day + student idle gaps
      const penalty = (r.softMetrics?.sameSubjectSameDayCount || 0) * 10 + (r.softMetrics?.studentIdleGapCount || 0);
      if (penalty < minPenalty) {
        minPenalty = penalty;
        bestDist = r.algorithm;
      }
    }

    const compDoc = await Comparison.create({
      _id: comparisonDocId,
      scope: rawIds && rawIds.length > 0 ? 'CUSTOM' : 'ALL',
      sectionIds,
      sectionCount: sections.length,
      totalSessions: subjects.length > 0 ? comparisonResults[0].scheduledCount + comparisonResults[0].unscheduledCount : 0,
      runs: comparisonResults.map(r => ({
        algorithm: r.algorithm,
        algorithmRunId: r.algorithmRunId,
        runtimeMs: r.runtimeMs,
        scheduledCount: r.scheduledCount,
        unscheduledCount: r.unscheduledCount,
        completionRate: r.completionRate,
        searchNodes: r.searchNodes,
        backtracks: r.backtracks,
        colorsUsed: r.colorsUsed,
        validationStatus: r.validationStatus,
        softMetrics: r.softMetrics
      })),
      winners: {
        fastest,
        highestCompletion,
        bestDistribution: bestDist
      },
      createdAt: new Date()
    });

    return res.json(envelope(true, {
      comparisonId: compDoc._id,
      sectionCount: sections.length,
      totalSessions: compDoc.totalSessions,
      winners: compDoc.winners,
      runs: comparisonResults
    }, null));

  } catch (err) {
    console.error('Comparison error:', err);
    return res.status(500).json(envelope(false, null, {
      code: 'E_INTERNAL', message: err.message
    }));
  }
});

/**
 * POST /api/generate/:algorithm
 * algorithm = greedy | backtracking | graph-coloring
 */
router.post('/:algorithm', async (req, res) => {
  try {
    const { algorithm } = req.params;
    const { sectionIds: rawIds, params } = req.body || {};

    const { settings, sections, teachers, rooms, subjects, sectionIds } = await prepareData(rawIds);

    const binaryName = algorithm === 'backtracking' ? 'backtracking'
                     : algorithm === 'graph-coloring' ? 'graph-coloring'
                     : (algorithm === 'combined' || algorithm === 'hybrid') ? 'combined'
                     : 'scheduler';

    if (!verifyBinaryExists(binaryName)) {
      throw new Error(`${binaryName} binary not found. Run: npm run build:engine`);
    }

    const engineInput = {
      mode: 'schedule',
      algorithm,
      params: params || {},
      settings,
      sections,
      teachers,
      rooms,
      subjects
    };

    const inputHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(engineInput))
      .digest('hex');

    const scheduleResult = await runEngine(binaryName, engineInput);

    const validatorInput = {
      ...engineInput,
      mode: 'validate',
      assignments: scheduleResult.assignments,
      unscheduled: scheduleResult.unscheduled
    };
    const validationResult = await runEngine('validator', validatorInput);

    const softMetrics = computeSoftMetrics(scheduleResult.assignments, {
      sections,
      teachers,
      subjects,
      numDays: settings.workingDays ? settings.workingDays.length : 5
    });

    const algoRun = await AlgorithmRun.create({
      algorithm,
      parameters: params || {},
      inputHash,
      engineStatus: scheduleResult.searchStatus || 'UNKNOWN',
      metrics: scheduleResult.metrics,
      validationStatus: validationResult.validationStatus,
      assignments: scheduleResult.assignments || [],
      unscheduled: scheduleResult.unscheduled || [],
      createdAt: new Date()
    });

    return res.json(envelope(true, {
      algorithmRunId: algoRun._id,
      schedule: scheduleResult,
      validation: validationResult,
      softMetrics
    }, null));

  } catch (err) {
    console.error('Generate route error:', err);
    return res.status(500).json(envelope(false, null, {
      code: 'E_INTERNAL', message: err.message
    }));
  }
});

module.exports = router;
