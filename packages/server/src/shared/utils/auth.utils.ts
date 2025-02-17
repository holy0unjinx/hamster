import jwt from 'jsonwebtoken';
import { JWT_CONFIG } from '@config/jwt.config';
import { TokenBlacklist } from '@modules/auth/model/tokenBlacklist.model';
import { InvalidTokenError } from '@type/error.type';

export const authUtils = {
  generateTokens: (payload: object) => ({
    accessToken: jwt.sign(payload, JWT_CONFIG.ACCESS_SECRET, {
      algorithm: JWT_CONFIG.ALGORITHM,
      expiresIn: JWT_CONFIG.ACCESS_EXPIRES_IN,
    } as jwt.SignOptions),
    refreshToken: jwt.sign(payload, JWT_CONFIG.REFRESH_SECRET, {
      algorithm: JWT_CONFIG.ALGORITHM,
      expiresIn: JWT_CONFIG.REFRESH_EXPIRES_IN,
    } as jwt.SignOptions),
  }),

  rotateRefreshToken: async (refreshToken: string) => {
    try {
      const decoded = jwt.verify(
        refreshToken,
        JWT_CONFIG.REFRESH_SECRET,
      ) as jwt.JwtPayload;
      await TokenBlacklist.addToBlacklist(refreshToken);
      return authUtils.generateTokens(decoded);
    } catch (error) {
      throw new InvalidTokenError();
    }
  },

  invalidateToken: async (token: string) => {
    await TokenBlacklist.addToBlacklist(token);
  },
};
