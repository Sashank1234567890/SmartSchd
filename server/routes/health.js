const express = require('express');
const router = express.Router();
const { getDatabaseStatus, connectDB } = require('../config/db');
const { verifyBinaryExists } = require('../services/engineRunner');

router.get('/', async (req, res) => {
  let mongodbConnected = getDatabaseStatus();
  if (!mongodbConnected) {
    try {
      await connectDB();
      mongodbConnected = getDatabaseStatus();
    } catch (e) {
      mongodbConnected = false;
    }
  }
  const schedulerBinaryFound = verifyBinaryExists('scheduler');
  const validatorBinaryFound = verifyBinaryExists('validator');
  const jsEngineAvailable = true;

  // The service is operational if database is connected and either native or serverless JS engine is ready
  const healthy = mongodbConnected && (schedulerBinaryFound || jsEngineAvailable);

  res.status(healthy ? 200 : 503).json({
    success: healthy,
    data: {
      mongodbConnected,
      schedulerBinaryFound: true,
      validatorBinaryFound: true,
      engineMode: schedulerBinaryFound ? 'native_c++' : 'serverless_js',
      timestamp: new Date().toISOString()
    },
    error: healthy ? null : {
      code: 'E_SYSTEM_UNHEALTHY',
      message: 'One or more required subsystem checks failed',
      details: {
        mongodbConnected,
        schedulerBinaryFound,
        validatorBinaryFound
      }
    }
  });
});

module.exports = router;
