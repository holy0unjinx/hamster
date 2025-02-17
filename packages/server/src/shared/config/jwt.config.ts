import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { logger } from '@utils/logger';
dotenv.config();

if (!process.env.REFRESH_SECRET) {
  logger.error('환경변수 ACCESS_SECRET이 설정되지 않았습니다.');
} else if (!process.env.REFRESH_SECRET) {
  logger.error('환경변수 REFRESH_SECRET이 설정되지 않았습니다.');
}

export const JWT_CONFIG = {
  ALGORITHM: process.env.ALGORITHM || ('HS256' as const),

  ACCESS_SECRET: process.env.ACCESS_SECRET as jwt.Secret,
  REFRESH_SECRET: process.env.REFRESH_SECRET as jwt.Secret,
  ACCESS_EXPIRES_IN: process.env.ACCESS_EXPIRES_IN || ('15m' as const),
  REFRESH_EXPIRES_IN: process.env.REFRESH_EXPIRES_IN || ('7d' as const),
};
