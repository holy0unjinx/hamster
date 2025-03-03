import morgan from 'morgan';
import { createContextLogger, logger } from '../utils/logger';
import { RequestHandler } from 'express';
import split from 'split';

const morganFormat = morgan.compile(
  ':remote-addr - :method :url :status :res[content-length] - :response-time ms',
);

export const httpLogger: RequestHandler = morgan(morganFormat, {
  stream: split().on('data', (line: string) => {
    logger.http(line.trim());
  }),
  skip: (req: any) => req.path === '/healthcheck',
});

export const requestContentMiddleware: RequestHandler = (req, res, next) => {
  const ctx = {
    requestId: req.headers['x-request-id'] as string,
  };

  req.logger = createContextLogger(ctx);
  next();
};
