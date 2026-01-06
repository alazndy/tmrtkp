type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: unknown;
}

const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Centralized logger for consistent and secure logging
 * - Development: Full console output
 * - Production: Sanitized output, ready for external logging service
 */
export const logger = {
  debug: (message: string, data?: unknown) => {
    log('debug', message, data);
  },

  info: (message: string, data?: unknown) => {
    log('info', message, data);
  },

  warn: (message: string, data?: unknown) => {
    log('warn', message, data);
  },

  error: (message: string, error?: unknown) => {
    // Sanitize error for production - don't leak stack traces
    const sanitizedError = sanitizeError(error);
    log('error', message, sanitizedError);
  },
};

function log(level: LogLevel, message: string, data?: unknown) {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    data,
  };

  if (isDevelopment) {
    // Full console output in development
    const consoleMethod = level === 'debug' ? 'log' : level;
    console[consoleMethod](`[${level.toUpperCase()}]`, message, data ?? '');
  } else {
    // Production: only log errors and warnings
    if (level === 'error' || level === 'warn') {
      // In production, you would send this to a logging service like:
      // - Sentry
      // - LogRocket
      // - Vercel Analytics
      // - Custom logging endpoint
      
      // For now, use structured console output
      console[level](JSON.stringify(entry));
    }
  }
}

function sanitizeError(error: unknown): Record<string, unknown> | string | undefined {
  if (!error) return undefined;

  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      // Only include stack in development
      ...(isDevelopment && { stack: error.stack }),
    };
  }

  if (typeof error === 'string') {
    return error;
  }

  if (typeof error === 'object') {
    // Remove potentially sensitive fields - prefix with _ to indicate intentional non-use
    const { password: _password, token: _token, apiKey: _apiKey, secret: _secret, ...safeFields } = error as Record<string, unknown>;
    return safeFields;
  }

  return String(error);
}

export default logger;
