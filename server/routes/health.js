const express = require('express');
const router = express.Router();
const { getDatabaseStatus } = require('../config/db');
const { verifyBinaryExists } = require('../services/engineRunner');

router.get('/', (req, res) => {
  const mongodbConnected = getDatabaseStatus();
  const schedulerBinaryFound = verifyBinaryExists('scheduler');
  const validatorBinaryFound = verifyBinaryExists('validator');

  const healthy = mongodbConnected && schedulerBinaryFound && validatorBinaryFound;

  res.status(healthy ? 200 : 503).json({
    success: healthy,
    data: {
      mongodbConnected,
      schedulerBinaryFound,
      validatorBinaryFound,
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
