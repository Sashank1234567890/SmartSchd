const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { connectDB } = require('./config/db');
const app = require('./app');

const PORT = parseInt(process.env.PORT, 10) || 3001;

let isDbConnected = false;
async function ensureDb() {
  if (!isDbConnected) {
    try {
      await connectDB();
      isDbConnected = true;
    } catch (err) {
      console.error('MongoDB serverless connection error:', err.message);
    }
  }
}

// Universal Serverless Request Handler for Vercel / Cloud Functions
const handler = async (req, res) => {
  await ensureDb();
  return app(req, res);
};

async function startServer() {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();
    isDbConnected = true;
    console.log('MongoDB connected successfully.');

    const server = app.listen(PORT, () => {
      console.log(`SmartSched backend server running on http://localhost:${PORT}`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} already in use. Run: lsof -ti :${PORT} | xargs kill -9`);
      } else {
        console.error('Server error:', err.message);
      }
      process.exit(1);
    });

    // Graceful shutdown
    const shutdown = (signal) => {
      console.log(`${signal} received. Closing HTTP server...`);
      server.close(() => {
        console.log('HTTP server closed.');
        process.exit(0);
      });
    };
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT',  () => shutdown('SIGINT'));

    return server;
  } catch (err) {
    console.error('Failed to initialize server:', err.message);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = handler;
module.exports.app = app;
module.exports.startServer = startServer;
