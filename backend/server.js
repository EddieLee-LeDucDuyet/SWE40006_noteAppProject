const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const os = require('os');
const notesRouter = require('./routes/notes');
const authRouter = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Instrumentation: Status Monitor Dashboard ──────────────────
const statusMonitor = require('express-status-monitor')({
  title: 'NoteFlow Server Monitor',
  path: '/status',
  spans: [
    { interval: 1,  retention: 60  },  // 1 second intervals, 60 seconds retained
    { interval: 5,  retention: 60  },  // 5 second intervals
    { interval: 15, retention: 60  },  // 15 second intervals
  ],
  chartVisibility: {
    cpu: true,
    mem: true,
    load: true,
    responseTime: true,
    rps: true,
    statusCodes: true,
  },
  healthChecks: [{
    protocol: 'http',
    host: 'localhost',
    path: '/health',
    port: PORT,
  }]
});

app.use(statusMonitor);

// ── Core Middleware ────────────────────────────────────────────
const frontendOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';
app.use(cors({ origin: frontendOrigin, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// ── Request counter ────────────────────────────────────────────
let requestCount = 0;
let errorCount = 0;
const startTime = Date.now();

app.use((req, res, next) => {
  requestCount++;
  res.on('finish', () => {
    if (res.statusCode >= 400) errorCount++;
  });
  next();
});

// ── Health check ───────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'OK' }));

// ── Metrics endpoint ───────────────────────────────────────────
app.get('/metrics', (req, res) => {
  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
  const memoryUsage = process.memoryUsage();
  const totalMem = os.totalmem();
  const freeMem = os.freemem();

  res.json({
    server: {
      status: 'running',
      uptime_seconds: uptimeSeconds,
      uptime_human: formatUptime(uptimeSeconds),
      node_version: process.version,
      platform: process.platform,
    },
    performance: {
      cpu_load_avg_1min: os.loadavg()[0].toFixed(2),
      cpu_load_avg_5min: os.loadavg()[1].toFixed(2),
      cpu_cores: os.cpus().length,
    },
    memory: {
      total_mb: (totalMem / 1024 / 1024).toFixed(2),
      free_mb: (freeMem / 1024 / 1024).toFixed(2),
      used_mb: ((totalMem - freeMem) / 1024 / 1024).toFixed(2),
      used_percent: (((totalMem - freeMem) / totalMem) * 100).toFixed(2) + '%',
      heap_used_mb: (memoryUsage.heapUsed / 1024 / 1024).toFixed(2),
      heap_total_mb: (memoryUsage.heapTotal / 1024 / 1024).toFixed(2),
    },
    requests: {
      total: requestCount,
      errors: errorCount,
      success_rate: requestCount > 0
        ? (((requestCount - errorCount) / requestCount) * 100).toFixed(2) + '%'
        : '100%',
    },
  });
});

// ── Notes API ──────────────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/notes', notesRouter);

// ── Serve React frontend in production ─────────────────────────
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'public')));
  app.get('/{*splat}', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
}

// ── Uptime formatter ───────────────────────────────────────────
function formatUptime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}h ${m}m ${s}s`;
}

// ── Start server ───────────────────────────────────────────────
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`✅ NoteFlow server running on port ${PORT}`);
    console.log(`📊 Status dashboard → http://localhost:${PORT}/status`);
    console.log(`📈 Metrics endpoint → http://localhost:${PORT}/metrics`);
  });
}

module.exports = app;