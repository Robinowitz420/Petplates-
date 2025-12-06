// lib/utils/logger.ts
// Centralized logging utility for production-ready logging

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private log(level: LogLevel, message: string, ...args: any[]): void {
    if (!this.isDevelopment && level === 'debug') {
      return; // Skip debug logs in production
    }

    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

    switch (level) {
      case 'error':
        console.error(prefix, message, ...args);
        // In production, you might want to send to error tracking service
        // e.g., Sentry.captureException(new Error(message));
        break;
      case 'warn':
        console.warn(prefix, message, ...args);
        break;
      case 'info':
        if (this.isDevelopment) {
          console.info(prefix, message, ...args);
        }
        break;
      case 'debug':
        if (this.isDevelopment) {
          console.debug(prefix, message, ...args);
        }
        break;
    }
  }

  debug(message: string, ...args: any[]): void {
    this.log('debug', message, ...args);
  }

  info(message: string, ...args: any[]): void {
    this.log('info', message, ...args);
  }

  warn(message: string, ...args: any[]): void {
    this.log('warn', message, ...args);
  }

  error(message: string, error?: Error | unknown, ...args: any[]): void {
    if (error instanceof Error) {
      this.log('error', message, error.message, error.stack, ...args);
    } else {
      this.log('error', message, error, ...args);
    }
  }
}

export const logger = new Logger();
