const fs = require('fs').promises;
const path = require('path');
const os = require('os');

class PerformanceLogger {
  constructor() {
    this.logDir = path.join(__dirname, '../logs');
    this.logFile = path.join(this.logDir, `server-metrics-${new Date().toISOString().split('T')[0]}.log`);
    this.initializeLogger();
  }

  async initializeLogger() {
    try {
      await fs.mkdir(this.logDir, { recursive: true });
    } catch (error) {
      console.error('Error creating log directory:', error);
    }
  }

  async logMetrics() {
    try {
      const metrics = this.gatherMetrics();
      const timestamp = new Date().toISOString();
      const logEntry = {
        timestamp,
        ...metrics
      };

      await fs.appendFile(
        this.logFile,
        JSON.stringify(logEntry) + '\n',
        'utf8'
      );

      // Rotate logs if file size exceeds 10MB
      const stats = await fs.stat(this.logFile);
      if (stats.size > 10 * 1024 * 1024) {
        await this.rotateLogFile();
      }

    } catch (error) {
      console.error('Error logging metrics:', error);
    }
  }

  gatherMetrics() {
    const used = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    const osMetrics = {
      totalMem: os.totalmem(),
      freeMem: os.freemem(),
      loadAvg: os.loadavg(),
      cpuCount: os.cpus().length,
      uptime: os.uptime()
    };

    return {
      process: {
        pid: process.pid,
        uptime: process.uptime(),
        nodeVersion: process.version,
        memory: {
          rss: this.formatBytes(used.rss),
          heapTotal: this.formatBytes(used.heapTotal),
          heapUsed: this.formatBytes(used.heapUsed),
          external: this.formatBytes(used.external),
          arrayBuffers: this.formatBytes(used.arrayBuffers || 0)
        },
        cpu: {
          user: cpuUsage.user,
          system: cpuUsage.system
        }
      },
      system: {
        platform: os.platform(),
        arch: os.arch(),
        totalMemory: this.formatBytes(osMetrics.totalMem),
        freeMemory: this.formatBytes(osMetrics.freeMem),
        memoryUsage: ((osMetrics.totalMem - osMetrics.freeMem) / osMetrics.totalMem * 100).toFixed(2) + '%',
        loadAverage: osMetrics.loadAvg,
        cpuCount: osMetrics.cpuCount,
        uptime: this.formatUptime(osMetrics.uptime)
      }
    };
  }

  formatBytes(bytes) {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let value = bytes;
    let unitIndex = 0;

    while (value >= 1024 && unitIndex < units.length - 1) {
      value /= 1024;
      unitIndex++;
    }

    return `${value.toFixed(2)}${units[unitIndex]}`;
  }

  formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return `${days}d ${hours}h ${minutes}m ${remainingSeconds}s`;
  }

  async rotateLogFile() {
    const date = new Date().toISOString().split('T')[0];
    const newLogFile = path.join(this.logDir, `server-metrics-${date}-${Date.now()}.log`);
    await fs.rename(this.logFile, newLogFile);
  }

  async getMetricsSummary(duration = '1h') {
    try {
      const content = await fs.readFile(this.logFile, 'utf8');
      const lines = content.trim().split('\n');
      const now = Date.now();
      const durationMs = this.parseDuration(duration);
      
      const relevantLogs = lines
        .map(line => JSON.parse(line))
        .filter(log => new Date(log.timestamp).getTime() > now - durationMs);

      return this.calculateMetricsSummary(relevantLogs);
    } catch (error) {
      console.error('Error getting metrics summary:', error);
      return null;
    }
  }

  parseDuration(duration) {
    const unit = duration.slice(-1);
    const value = parseInt(duration.slice(0, -1));
    
    switch (unit) {
      case 'h': return value * 60 * 60 * 1000;
      case 'm': return value * 60 * 1000;
      case 'd': return value * 24 * 60 * 60 * 1000;
      default: return 60 * 60 * 1000; // default 1h
    }
  }

  calculateMetricsSummary(logs) {
    if (!logs.length) return null;

    const summary = {
      period: {
        start: logs[0].timestamp,
        end: logs[logs.length - 1].timestamp
      },
      memory: {
        average: {},
        peak: {}
      },
      cpu: {
        average: {},
        peak: {}
      },
      system: {
        averageLoad: [0, 0, 0],
        peakLoad: [0, 0, 0]
      }
    };

    // Calculate summaries
    logs.forEach(log => {
      // Memory metrics
      Object.entries(log.process.memory).forEach(([key, value]) => {
        const numValue = parseFloat(value);
        if (!summary.memory.average[key]) summary.memory.average[key] = 0;
        if (!summary.memory.peak[key]) summary.memory.peak[key] = 0;
        
        summary.memory.average[key] += numValue;
        summary.memory.peak[key] = Math.max(summary.memory.peak[key], numValue);
      });

      // CPU metrics
      Object.entries(log.process.cpu).forEach(([key, value]) => {
        if (!summary.cpu.average[key]) summary.cpu.average[key] = 0;
        if (!summary.cpu.peak[key]) summary.cpu.peak[key] = 0;
        
        summary.cpu.average[key] += value;
        summary.cpu.peak[key] = Math.max(summary.cpu.peak[key], value);
      });

      // System load
      log.system.loadAverage.forEach((load, i) => {
        summary.system.averageLoad[i] += load;
        summary.system.peakLoad[i] = Math.max(summary.system.peakLoad[i], load);
      });
    });

    // Calculate averages
    const count = logs.length;
    Object.keys(summary.memory.average).forEach(key => {
      summary.memory.average[key] /= count;
    });
    Object.keys(summary.cpu.average).forEach(key => {
      summary.cpu.average[key] /= count;
    });
    summary.system.averageLoad = summary.system.averageLoad.map(load => load / count);

    return summary;
  }
}

module.exports = new PerformanceLogger(); 