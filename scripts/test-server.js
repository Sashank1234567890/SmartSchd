const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { connectDB, getDatabaseStatus } = require('../server/config/db');
const { verifyBinaryExists } = require('../server/services/engineRunner');
const mongoose = require('mongoose');

async function testServer() {
  console.log('--- Server & Subsystem Tests ---');

  // Check engine binaries
  const schedFound = verifyBinaryExists('scheduler');
  const valFound = verifyBinaryExists('validator');
  console.log(`Scheduler binary found: ${schedFound}`);
  console.log(`Validator binary found: ${valFound}`);
  if (!schedFound || !valFound) {
    throw new Error('Engine binaries missing! Run npm run build:engine');
  }

  // Connect to MongoDB
  console.log('Testing MongoDB connection...');
  await connectDB();
  const dbConnected = getDatabaseStatus();
  console.log(`Database connected: ${dbConnected}`);
  if (!dbConnected) {
    throw new Error('Database not connected!');
  }

  await mongoose.disconnect();
  console.log('Server foundation tests PASSED!');
}

testServer().catch(err => {
  console.error('test:server FAILED:', err);
  process.exit(1);
});
