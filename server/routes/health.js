const express = require('express');
const keepAliveService = require('../utils/keepAlive');
const cronJobService = require('../utils/cronJobs');
const router = express.Router();

// Health check endpoint
router.get('/', (req, res) => {
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();
  
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: {
      seconds: Math.floor(uptime),
      human: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`
    },
    memory: {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024 * 100) / 100} MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024 * 100) / 100} MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024 * 100) / 100} MB`
    },
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version,
    platform: process.platform,
    keepAlive: keepAliveService.getStatus(),
    cronJobs: cronJobService.getStatus()
  });
});

// Detailed system info endpoint
router.get('/system', (req, res) => {
  const cpuUsage = process.cpuUsage();
  
  res.status(200).json({
    process: {
      pid: process.pid,
      ppid: process.ppid,
      platform: process.platform,
      arch: process.arch,
      version: process.version,
      title: process.title,
      argv: process.argv,
      cwd: process.cwd()
    },
    cpu: {
      user: cpuUsage.user,
      system: cpuUsage.system
    },
    memory: process.memoryUsage(),
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Keep-alive service control endpoints
router.post('/keep-alive/start', (req, res) => {
  try {
    keepAliveService.start();
    res.json({ message: 'Keep-alive service started', status: keepAliveService.getStatus() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/keep-alive/stop', (req, res) => {
  try {
    keepAliveService.stop();
    res.json({ message: 'Keep-alive service stopped', status: keepAliveService.getStatus() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/keep-alive/status', (req, res) => {
  res.json(keepAliveService.getStatus());
});

// Cron job service control endpoints
router.post('/cron/start', (req, res) => {
  try {
    cronJobService.start();
    res.json({ message: 'Cron job service started', status: cronJobService.getStatus() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/cron/stop', (req, res) => {
  try {
    cronJobService.stop();
    res.json({ message: 'Cron job service stopped', status: cronJobService.getStatus() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/cron/status', (req, res) => {
  res.json(cronJobService.getStatus());
});

// Force garbage collection endpoint (if available)
router.post('/gc', (req, res) => {
  if (global.gc) {
    global.gc();
    res.json({ message: 'Garbage collection performed', memory: process.memoryUsage() });
  } else {
    res.status(400).json({ error: 'Garbage collection not available. Start with --expose-gc flag.' });
  }
});

module.exports = router;
