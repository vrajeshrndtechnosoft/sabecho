import fs from 'fs/promises';
import path from 'path';
import os from 'os';

type MemoryUsage = {
  rss: string;
  heapTotal: string;
  heapUsed: string;
  external: string;
  arrayBuffers: string;
};

type CPUMetrics = {
  user: number;
  system: number;
};

type LoadAverage = [number, number, number];

type ProcessMetrics = {
  pid: number;
  uptime: number;
  nodeVersion: string;
  memory: MemoryUsage;
  cpu: CPUMetrics;
};

type SystemMetrics = {
  platform: string;
  arch: string;
  totalMemory: string;
  freeMemory: string;
  memoryUsage: string;
  loadAverage: LoadAverage;
  cpuCount: number;
  uptime: string;
};

type LogEntry = {
  timestamp: string;
  process: ProcessMetrics;
  system: SystemMetrics;
};

type MetricsSummary = {
  period: {
    start: string;
    end: string;
  };
  memory: {
    average: Record<string, number>;
    peak: Record<string, number>;
  };
  cpu: {
    average: Record<string, number>;
    peak: Record<string, number>;
  };
  system: {
    averageLoad: LoadAverage;
    peakLoad: LoadAverage;
  };
} | null;

class PerformanceLogger {
  private logDir: string;
  private logFile: string;

  constructor() {
    this.logDir = path.join(__dirname, '../logs');
    this.logFile = path.join(
      this.logDir,
      `server-metrics-${new Date().toISOString().split('T')[0]}.log`
    );
    this.initializeLogger();
  }

  private async initializeLogger(): Promise<void> {
    try {
      await fs.mkdir(this.logDir, { recursive: true });
    } catch (error) {
      console.error('Error creating log directory:', error);
    }
  }

  public async logMetrics(): Promise<void> {
    try {
      const metrics = this.gatherMetrics();
      const timestamp = new Date().toISOString();
      const logEntry: LogEntry = { timestamp, ...metrics };

      await fs.appendFile(this.logFile, JSON.stringify(logEntry) + '\n', 'utf8');

      const stats = await fs.stat(this.logFile);
      if (stats.size > 10 * 1024 * 1024) {
        await this.rotateLogFile();
      }
    } catch (error) {
      console.error('Error logging metrics:', error);
    }
  }

  private gatherMetrics(): Omit<LogEntry, 'timestamp'> {
    const used = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const loadAvg = os.loadavg();
    const cpuCount = os.cpus().length;
    const uptime = os.uptime();

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
          arrayBuffers: this.formatBytes(used.arrayBuffers || 0),
        },
        cpu: {
          user: cpuUsage.user,
          system: cpuUsage.system,
        },
      },
      system: {
        platform: os.platform(),
        arch: os.arch(),
        totalMemory: this.formatBytes(totalMem),
        freeMemory: this.formatBytes(freeMem),
        memoryUsage: `${(((totalMem - freeMem) / totalMem) * 100).toFixed(2)}%`,
        loadAverage: loadAvg as LoadAverage,
        cpuCount,
        uptime: this.formatUptime(uptime),
      },
    };
  }

  private formatBytes(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let value = bytes;
    let unitIndex = 0;

    while (value >= 1024 && unitIndex < units.length - 1) {
      value /= 1024;
      unitIndex++;
    }

    return `${value.toFixed(2)}${units[unitIndex]}`;
  }

  private formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return `${days}d ${hours}h ${minutes}m ${remainingSeconds}s`;
  }

  private async rotateLogFile(): Promise<void> {
    const date = new Date().toISOString().split('T')[0];
    const newLogFile = path.join(this.logDir, `server-metrics-${date}-${Date.now()}.log`);
    await fs.rename(this.logFile, newLogFile);
  }

  public async getMetricsSummary(duration = '1h'): Promise<MetricsSummary> {
    try {
      const content = await fs.readFile(this.logFile, 'utf8');
      const lines = content.trim().split('\n');
      const now = Date.now();
      const durationMs = this.parseDuration(duration);

      const relevantLogs: LogEntry[] = lines
        .map(line => JSON.parse(line))
        .filter((log: LogEntry) => new Date(log.timestamp).getTime() > now - durationMs);

      return this.calculateMetricsSummary(relevantLogs);
    } catch (error) {
      console.error('Error getting metrics summary:', error);
      return null;
    }
  }

  private parseDuration(duration: string): number {
    const unit = duration.slice(-1);
    const value = parseInt(duration.slice(0, -1), 10);

    switch (unit) {
      case 'h': return value * 60 * 60 * 1000;
      case 'm': return value * 60 * 1000;
      case 'd': return value * 24 * 60 * 60 * 1000;
      default: return 60 * 60 * 1000;
    }
  }

  private calculateMetricsSummary(logs: LogEntry[]): MetricsSummary {
    if (!logs.length) return null;

    const summary: MetricsSummary = {
      period: {
        start: logs[0].timestamp,
        end: logs[logs.length - 1].timestamp,
      },
      memory: {
        average: {},
        peak: {},
      },
      cpu: {
        average: {},
        peak: {},
      },
      system: {
        averageLoad: [0, 0, 0],
        peakLoad: [0, 0, 0],
      },
    };

    logs.forEach(log => {
      // Memory
      Object.entries(log.process.memory).forEach(([key, val]) => {
        const num = parseFloat(val);
        summary.memory.average[key] = (summary.memory.average[key] || 0) + num;
        summary.memory.peak[key] = Math.max(summary.memory.peak[key] || 0, num);
      });

      // CPU
      Object.entries(log.process.cpu).forEach(([key, val]) => {
        summary.cpu.average[key] = (summary.cpu.average[key] || 0) + val;
        summary.cpu.peak[key] = Math.max(summary.cpu.peak[key] || 0, val);
      });

      // System Load
      log.system.loadAverage.forEach((load, i) => {
        summary.system.averageLoad[i] += load;
        summary.system.peakLoad[i] = Math.max(summary.system.peakLoad[i], load);
      });
    });

    const count = logs.length;
    Object.keys(summary.memory.average).forEach(key => {
      summary.memory.average[key] /= count;
    });
    Object.keys(summary.cpu.average).forEach(key => {
      summary.cpu.average[key] /= count;
    });
    summary.system.averageLoad = summary.system.averageLoad.map(load => load / count) as LoadAverage;

    return summary;
  }
}
const performanceLogger = new PerformanceLogger();
export default performanceLogger;