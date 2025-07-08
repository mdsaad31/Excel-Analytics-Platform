const https = require('https');
const http = require('http');

class KeepAliveService {
  constructor() {
    this.interval = null;
    this.pingInterval = 14 * 60 * 1000; // 14 minutes (Render free tier sleeps after 15 minutes)
    this.serverUrl = process.env.RENDER_EXTERNAL_URL || process.env.SERVER_URL || 'http://localhost:5000';
    this.isActive = false;
  }

  start() {
    if (this.isActive) {
      console.log('Keep-alive service is already running');
      return;
    }

    this.isActive = true;
    console.log(`🚀 Keep-alive service started - pinging every ${this.pingInterval / 60000} minutes`);
    console.log(`🎯 Target URL: ${this.serverUrl}/health`);

    // Start pinging immediately, then at intervals
    this.ping();
    this.interval = setInterval(() => {
      this.ping();
    }, this.pingInterval);

    // Handle process termination
    process.on('SIGINT', () => this.stop());
    process.on('SIGTERM', () => this.stop());
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      this.isActive = false;
      console.log('🛑 Keep-alive service stopped');
    }
  }

  ping() {
    const url = `${this.serverUrl}/health`;
    const isHttps = url.startsWith('https://');
    const client = isHttps ? https : http;

    const startTime = Date.now();
    
    const req = client.get(url, (res) => {
      const responseTime = Date.now() - startTime;
      
      if (res.statusCode === 200) {
        console.log(`✅ Keep-alive ping successful (${responseTime}ms) - ${new Date().toISOString()}`);
      } else {
        console.log(`⚠️ Keep-alive ping returned status ${res.statusCode} - ${new Date().toISOString()}`);
      }
    });

    req.on('error', (error) => {
      console.error(`❌ Keep-alive ping failed:`, error.message);
    });

    req.setTimeout(30000, () => {
      req.destroy();
      console.error('❌ Keep-alive ping timed out');
    });
  }

  getStatus() {
    return {
      isActive: this.isActive,
      pingInterval: this.pingInterval,
      serverUrl: this.serverUrl,
      nextPing: this.interval ? new Date(Date.now() + this.pingInterval).toISOString() : null
    };
  }
}

module.exports = new KeepAliveService();
