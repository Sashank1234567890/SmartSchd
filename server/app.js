const express = require('express');
const cors = require('cors');
const path = require('path');

const healthRoutes = require('./routes/health');
const sectionRoutes = require('./routes/sections');
const roomRoutes = require('./routes/rooms');
const teacherRoutes = require('./routes/teachers');
const subjectRoutes = require('./routes/subjects');
const settingsRoutes = require('./routes/settings');
const validateRoutes = require('./routes/validate');
const devRoutes = require('./routes/dev');

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// API Routes
app.use('/api', require('./routes'));


// In production, serve the built client
if (process.env.NODE_ENV === 'production') {
  const clientDist = path.resolve(__dirname, '../client/dist');
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Global 404 handler for unmatched /api routes
app.all('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    data: null,
    error: {
      code: 'E_NOT_FOUND',
      message: `API endpoint '${req.method} ${req.originalUrl}' does not exist.`
    }
  });
});

// Central error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    data: null,
    error: {
      code: err.code || 'E_INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected internal server error occurred.',
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    }
  });
});

module.exports = app;
