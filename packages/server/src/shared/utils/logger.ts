import winston, { format } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import Transport from 'winston-transport';

declare module 'winston' {
  interface LeveledLogMethod {
    http: (message: string, meta?: object) => Logger;
  }
}

const { combine, timestamp, printf, colorize, errors } = format;

const SENSITIVE_FIELDS = ['password', 'token', 'authorization'];

export type LoggerContext = {
  requestId?: string;
  userId?: number;
  userType?: 'student' | 'teacher';
};

const sensitiveDataFilter = format((info: any) => {
  if (info.body) {
    SENSITIVE_FIELDS.forEach((field) => {
      if (info.body[field]) info.body[field] = '***REDACTED***';
    });
  }
  return info;
});

const logFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
  return `${timestamp} [${level}] ${message} ${stack || ''} ${JSON.stringify(
    meta,
  )}`;
});

const getLogPath = (filename: string) => {
  return process.env.VERCEL ? `/tmp/logs/${filename}` : `logs/${filename}`;
};

const transports: Transport[] = [
  new DailyRotateFile({
    filename: getLogPath('application-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '30d',
    level: 'http',
    format: combine(sensitiveDataFilter(), errors({ stack: true }), logFormat),
  }),
  new winston.transports.Console({
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
    format: combine(
      colorize(),
      sensitiveDataFilter(),
      errors({ stack: true }),
      logFormat,
    ),
  }),
];

if (process.env.NODE_ENV === 'production') {
  transports.push(
    new winston.transports.Http({
      level: 'error',
      host: process.env.LOGGING_SERVICE_HOST,
      path: '/api/logs',
      ssl: true,
    }),
  );
}

export const logger = winston.createLogger({
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 4,
    debug: 5,
  },
  defaultMeta: { service: '@hamster/server' },
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.metadata({
      fillExcept: ['message', 'level', 'timestamp', 'label'],
    }),
  ),
  transports,
  exceptionHandlers: [
    new DailyRotateFile({
      filename: getLogPath('application-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
    }),
  ],
  rejectionHandlers: [
    new DailyRotateFile({
      filename: getLogPath('application-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
    }),
  ],
});

export const createContextLogger = (ctx: LoggerContext) => ({
  error: (message: string, meta?: object) =>
    logger.error(message, { ...meta, ...ctx }),
  warn: (message: string, meta?: object) =>
    logger.warn(message, { ...meta, ...ctx }),
  info: (message: string, meta?: object) =>
    logger.info(message, { ...meta, ...ctx }),
  http: (message: string, meta?: object) =>
    logger.http(message, { ...meta, ...ctx }),
  debug: (message: string, meta?: object) =>
    logger.debug(message, { ...meta, ...ctx }),
});
