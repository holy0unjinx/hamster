import jwt from 'jsonwebtoken';
import { JWT_CONFIG } from '@config/jwt.config';
import { TokenBlacklist } from '@modules/auth/model/tokenBlacklist.model';
import { InvalidTokenError } from '@type/error.type';
import { Payload } from '@type/jwt.type';

export const authUtils = {
  // 토큰 생성성
  generateTokens: (payload: Payload) => ({
    accessToken: jwt.sign(payload, JWT_CONFIG.ACCESS_SECRET, {
      algorithm: JWT_CONFIG.ALGORITHM,
      expiresIn: JWT_CONFIG.ACCESS_EXPIRES_IN,
    } as jwt.SignOptions),
    refreshToken: jwt.sign(payload, JWT_CONFIG.REFRESH_SECRET, {
      algorithm: JWT_CONFIG.ALGORITHM,
      expiresIn: JWT_CONFIG.REFRESH_EXPIRES_IN,
    } as jwt.SignOptions),
  }),

  // Refresh 토큰 회전
  rotateRefreshToken: async (refreshToken: string) => {
    try {
      const decoded = jwt.verify(
        refreshToken,
        JWT_CONFIG.REFRESH_SECRET,
      ) as Payload;
      await TokenBlacklist.addToBlacklist(refreshToken);
      return authUtils.generateTokens(decoded);
    } catch (error) {
      throw new InvalidTokenError();
    }
  },
};
