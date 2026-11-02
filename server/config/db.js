const mongoose = require('mongoose');

let isConnected = false;

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    const errorMsg = 'FATAL: MONGODB_URI environment variable is missing in .env. Cannot start SmartSched.';
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`MongoDB Connected: ${conn.connection.host} | Database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    isConnected = false;
    console.error(`MongoDB Connection Failed: ${error.message}`);
    // Never fall back silently; throw so caller handles with clear status
    throw error;
  }
}

function getDatabaseStatus() {
  // readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  return mongoose.connection.readyState === 1;
}

module.exports = {
  connectDB,
  getDatabaseStatus
};
