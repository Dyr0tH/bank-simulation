const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { testConnection, getDbStatus, dbConfig } = require('./config/db');

// Route imports
const authRoutes = require('./routes/authRoutes');
const accountRoutes = require('./routes/accountRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.originalUrl.startsWith('/api')) {
      console.log(`[${req.method}] ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// System Health & Database Diagnostic endpoint
app.get('/api/health', async (req, res) => {
  const dbTest = await testConnection();

  return res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Apex Bank Core API',
    database: {
      connected: dbTest.success,
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      databaseName: dbConfig.database,
      error: dbTest.error || null,
      workbenchHelp: dbTest.success
        ? 'Connected to MySQL database.'
        : 'Ensure MySQL Server is started (via MySQL Workbench / Windows Services). Verify password in server/.env.'
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/admin', adminRoutes);

// Root Welcome
app.get('/', (req, res) => {
  res.json({
    message: 'Apex Bank API is operational.',
    endpoints: {
      health: '/api/health',
      demoCredentials: '/api/auth/demo-credentials'
    }
  });
});

// 404 Handler for API
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found.' });
});

// Centralized Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error.'
  });
});

// Start listening if not required as a module
if (require.main === module) {
  app.listen(PORT, async () => {
    console.log(`\n======================================================`);
    console.log(`🏦 APEX BANK API SERVER`);
    console.log(`🚀 Running at: http://localhost:${PORT}`);
    console.log(`======================================================`);

    const dbTest = await testConnection();
    if (dbTest.success) {
      console.log(`✅ MySQL connection verified (${dbConfig.host}:${dbConfig.port} / ${dbConfig.database})`);
    } else {
      console.log(`⚠️  MySQL connection pending: ${dbTest.error}`);
      console.log(`💡 Check server/.env credentials or run schema.sql inside MySQL Workbench.`);
    }
    console.log(`======================================================\n`);
  });
}

module.exports = app;
