import jwt from 'jsonwebtoken';

export const JWT_CONFIG = {
  ALGORITHM: 'HS256' as const,

  ACCESS_SECRET: process.env.PRIVATE_SECRET! as jwt.Secret,
  REFRESH_SECRET: process.env.REFRESH_SECRET! as jwt.Secret,
  ACCESS_EXPIRES_IN: process.env.ACCESS_EXPIRES_IN || ('15m' as const),
  REFRESH_EXPIRES_IN: process.env.REFRESH_EXPIRES_IN || ('7d' as const),
};
