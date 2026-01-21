// Simple logger utility for ShadowLaunch API

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const colors = {
  debug: '\x1b[36m', // Cyan
  info: '\x1b[32m',  // Green
  warn: '\x1b[33m',  // Yellow
  error: '\x1b[31m', // Red
  reset: '\x1b[0m',
};

function formatLog(level: LogLevel, message: string, data?: unknown): string {
  const timestamp = new Date().toISOString();
  const color = colors[level];
  const reset = colors.reset;

  let logLine = `${color}[${timestamp}] [${level.toUpperCase()}]${reset} ${message}`;

  if (data !== undefined) {
    if (typeof data === 'object') {
      logLine += `\n${JSON.stringify(data, null, 2)}`;
    } else {
      logLine += ` ${data}`;
    }
  }

  return logLine;
}

function log(level: LogLevel, message: string, data?: unknown): void {
  const logLine = formatLog(level, message, data);

  switch (level) {
    case 'debug':
      if (process.env.NODE_ENV === 'development') {
        console.debug(logLine);
      }
      break;
    case 'info':
      console.info(logLine);
      break;
    case 'warn':
      console.warn(logLine);
      break;
    case 'error':
      console.error(logLine);
      break;
  }
}

export const logger = {
  debug: (message: string, data?: unknown) => log('debug', message, data),
  info: (message: string, data?: unknown) => log('info', message, data),
  warn: (message: string, data?: unknown) => log('warn', message, data),
  error: (message: string, data?: unknown) => log('error', message, data),
};

export default logger;
