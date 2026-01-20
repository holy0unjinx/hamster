import { LoggerContext } from '../utils/logger';

declare global {
  namespace Express {
    interface Request {
      logger: ReturnType<typeof createContextLogger>;
      user?: {
        id?: string;
        role?: 'student' | 'teacher' | 'john';
      };
    }
  }
}
