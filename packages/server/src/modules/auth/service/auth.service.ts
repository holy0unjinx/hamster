import bcrypt from 'bcrypt';
import { User, StudentProfile, TeacherProfile } from '../model/user.model';
import { authUtils } from '@utils/auth.utils';
import { RegistrationDto } from '@/shared/types/auth.dto';
import {
  AccountInactiveError,
  InvalidCredentialsError,
  InvalidTokenError,
  UserExistError,
} from '@/shared/types/error.type';
import jwt from 'jsonwebtoken';
import sequelize from '@config/database';
import { NextFunction, Request, Response } from 'express';
import { JWT_CONFIG } from '@config/jwt.config';
import { TokenBlacklist } from '../model/tokenBlacklist.model';

export class AuthService {
  async registerUser(registrationData: RegistrationDto) {
    const { identifier, password, role, name, ...profileData } =
      registrationData;

    const existingUser = await User.findOne({ where: { identifier } });
    if (existingUser) {
      throw new UserExistError();
    }

    const passwordHash = await bcrypt.hash(password, 12);

    return sequelize.transaction(async (t) => {
      const user = await User.create(
        {
          identifier,
          passwordHash,
          role,
          name,
        },
        { transaction: t },
      );

      if (role === 'student') {
        await StudentProfile.create(
          {
            userId: user.userId,
            ...profileData,
          },
          { transaction: t },
        );
      } else if (role === 'teacher') {
        await TeacherProfile.create(
          {
            userId: user.userId,
            ...profileData,
          },
          { transaction: t },
        );
      }

      return authUtils.generateTokens({
        userId: user.userId,
        role: user.role,
      });
    });
  }

  async loginUser(identifier: string, password: string) {
    const user = await User.findOne({ where: { identifier } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new InvalidCredentialsError();
    }

    if (!user.isActive) {
      throw new AccountInactiveError();
    }

    return authUtils.generateTokens({
      userId: user.userId,
      role: user.role,
    });
  }

  async refresh(req: Request, res: Response) {
    const { refreshToken } = req.body;

    try {
      const newTokens = await authUtils.rotateRefreshToken(refreshToken);
      res.json(newTokens);
    } catch (error) {
      throw new InvalidTokenError();
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.split(' ')[1];

    try {
      if (!token) throw new InvalidTokenError();
      const decoded = jwt.verify(
        token,
        JWT_CONFIG.ACCESS_SECRET,
      ) as jwt.JwtPayload;

      await TokenBlacklist.addToBlacklist(token);
      res.setHeader('Clear-Site-Data', '"cookies", "storage"');
      res.removeHeader('Authorization');

      res.status(200).json({
        success: true,
        message: '로그아웃 성공',
      });
    } catch (error) {
      next(new Error('로그아웃 처리 실패'));
    }
  }
}
