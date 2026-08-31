import { STORAGE_KEYS } from '../constants/storageKeys';

export enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  action: string;
  category: string;
  details?: any;
  userId?: string;
  path: string;
}

class LoggerService {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  log(action: string, category: string, details?: any, level: LogLevel = LogLevel.INFO) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      action,
      category,
      details,
      path: window.location.pathname,
      userId: localStorage.getItem(STORAGE_KEYS.USER_ID) || 'anonymous',
    };

    this.logs.push(entry);
    
    // In a real app, we would send this to a backend API
    console.log(`[UI-AUDIT] ${entry.level}: ${entry.action} in ${entry.category}`, entry);

    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Persist to localStorage for audit demonstration
    this.persistLogs();
  }

  private persistLogs() {
    try {
      const persisted = JSON.parse(localStorage.getItem(STORAGE_KEYS.UI_AUDIT_LOGS) || '[]');
      persisted.push(this.logs[this.logs.length - 1]);
      if (persisted.length > 500) persisted.shift();
      localStorage.setItem(STORAGE_KEYS.UI_AUDIT_LOGS, JSON.stringify(persisted));
    } catch (e) {
      console.error('Failed to persist logs', e);
    }
  }

  getLogs() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.UI_AUDIT_LOGS) || '[]');
  }

  clearLogs() {
    localStorage.removeItem(STORAGE_KEYS.UI_AUDIT_LOGS);
    this.logs = [];
  }
}

export const logger = new LoggerService();
