const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('ERROR: MONGODB_URI not set in .env');
  process.exit(1);
}

// Mask credentials in stdout
const safeUri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
console.log(`Connecting to MongoDB at ${safeUri}...`);

mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 })
  .then(() => {
    console.log('MongoDB connection SUCCESSFUL! Database:', mongoose.connection.name);
    return mongoose.disconnect();
  })
  .then(() => {
    console.log('MongoDB connection closed cleanly.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('MongoDB connection FAILED:', err.message);
    process.exit(1);
  });
