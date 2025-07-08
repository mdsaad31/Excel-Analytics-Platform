const cron = require('node-cron');
const fetch = require('node-fetch');

class CronJobService {
  constructor() {
    this.jobs = new Map();
    this.isActive = false;
  }

  start() {
    if (this.isActive) {
      console.log('Cron job service is already running');
      return;
    }

    this.isActive = true;
    console.log('🕐 Cron job service started');

    // Health check every 10 minutes
    this.scheduleJob('health-check', '*/10 * * * *', async () => {
      await this.performHealthCheck();
    });

    // Daily cleanup job (runs at 2 AM)
    this.scheduleJob('daily-cleanup', '0 2 * * *', async () => {
      await this.performDailyCleanup();
    });

    // Weekly maintenance (runs Sunday at 3 AM)
    this.scheduleJob('weekly-maintenance', '0 3 * * 0', async () => {
      await this.performWeeklyMaintenance();
    });

    // Handle process termination
    process.on('SIGINT', () => this.stop());
    process.on('SIGTERM', () => this.stop());
  }

  scheduleJob(name, schedule, task) {
    if (this.jobs.has(name)) {
      console.log(`Job ${name} already exists`);
      return;
    }

    const job = cron.schedule(schedule, task, {
      scheduled: true,
      timezone: 'UTC'
    });

    this.jobs.set(name, job);
    console.log(`📅 Scheduled job: ${name} with schedule: ${schedule}`);
  }

  async performHealthCheck() {
    try {
      const serverUrl = process.env.RENDER_EXTERNAL_URL || process.env.SERVER_URL || 'http://localhost:5000';
      const response = await fetch(`${serverUrl}/health`, {
        method: 'GET',
        timeout: 10000
      });

      if (response.ok) {
        console.log('✅ Health check passed');
      } else {
        console.log(`⚠️ Health check failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Health check error:', error.message);
    }
  }

  async performDailyCleanup() {
    try {
      console.log('🧹 Starting daily cleanup...');
      
      // Add any cleanup tasks here
      // For example: clean old logs, temporary files, etc.
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
        console.log('♻️ Garbage collection performed');
      }

      console.log('✅ Daily cleanup completed');
    } catch (error) {
      console.error('❌ Daily cleanup error:', error.message);
    }
  }

  async performWeeklyMaintenance() {
    try {
      console.log('🔧 Starting weekly maintenance...');
      
      // Add any maintenance tasks here
      // For example: database optimization, cache clearing, etc.
      
      console.log('✅ Weekly maintenance completed');
    } catch (error) {
      console.error('❌ Weekly maintenance error:', error.message);
    }
  }

  stop() {
    console.log('🛑 Stopping cron job service...');
    
    this.jobs.forEach((job, name) => {
      job.stop();
      console.log(`⏹️ Stopped job: ${name}`);
    });
    
    this.jobs.clear();
    this.isActive = false;
    console.log('🛑 Cron job service stopped');
  }

  getStatus() {
    const jobStatus = {};
    this.jobs.forEach((job, name) => {
      jobStatus[name] = {
        running: job.running,
        scheduled: job.scheduled
      };
    });

    return {
      isActive: this.isActive,
      totalJobs: this.jobs.size,
      jobs: jobStatus
    };
  }
}

module.exports = new CronJobService();
