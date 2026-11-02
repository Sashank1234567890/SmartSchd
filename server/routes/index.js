// Central router that mounts all resource routers
const express = require('express');
const router = express.Router();

// Import individual routers
const subjectsRouter   = require('./subjects');
const teachersRouter   = require('./teachers');
const roomsRouter      = require('./rooms');
const sectionsRouter   = require('./sections');
const settingsRouter   = require('./settings');
const devRouter        = require('./dev');
const healthRouter     = require('./health');
const generateRouter   = require('./generate');
const timetablesRouter = require('./timetables');
const validateRouter   = require('./validate');

router.use('/subjects',   subjectsRouter);
router.use('/teachers',   teachersRouter);
router.use('/rooms',      roomsRouter);
router.use('/sections',   sectionsRouter);
router.use('/settings',   settingsRouter);
router.use('/dev',        devRouter);
router.use('/health',     healthRouter);
router.use('/generate',   generateRouter);
router.use('/timetables', timetablesRouter);
router.use('/validate',   validateRouter);

module.exports = router;
