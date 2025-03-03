import { Request, Response } from 'express';
import { AuthService } from '../service/auth.service';
import {
  InvalidCredentialsError,
  InvalidInformationError,
} from '../../../shared/types/error.type';
import { TeacherRegistrationDto } from '../../../shared/types/auth.dto';
import { addToken } from './auth.controller';
import { handleError } from '../../../shared/utils/handle.utils';
import { validateField } from '../../../shared/utils/validation.utils';
import { Prisma } from '@prisma/client';

function isTeacherRegistrationDto(body: any) {
  const email = validateField({
    name: 'email',
    type: String,
    raw: body.email,
  });
  const password = validateField({
    name: 'password',
    type: String,
    raw: body.password,
  });
  const name = validateField({
    name: 'name',
    type: String,
    raw: body.name,
  });
  const subjectId = validateField({
    name: 'subjectId',
    type: Number,
    raw: body.subjectId,
  });
  const teachersOffice = validateField({
    name: 'teachersOffice',
    type: Number,
    raw: body.teachersOffice,
    onValidate: (office) => {
      return office > 0 && office < 4;
    },
  });
  const homeroomClass = validateField({
    name: 'homeroomClass',
    type: Number,
    raw: body.homeroomClass,
    onValidate: (homeroom) => {
      return (
        (homeroom > 10 && homeroom < 18) ||
        (homeroom > 20 && homeroom < 27) ||
        (homeroom > 30 && homeroom < 37)
      );
    },
  });

  return { email, password, name, subjectId, teachersOffice, homeroomClass };
}

export class TeacherAuthController {
  constructor(private authService: AuthService) {}

  async register(req: Request, res: Response) {
    try {
      const registrationDto: TeacherRegistrationDto = isTeacherRegistrationDto(
        req.body,
      );
      const tokens = await this.authService.registerTeacher(registrationDto);
      await addToken(res, tokens);
      res.status(201).json({ success: true, data: tokens });
    } catch (error) {
      handleError(error, res);
    }
  }

  async login(req: Request, res: Response) {
    try {
      // 1. 입력값 검증
      const email = validateField({
        name: 'email',
        type: String,
        raw: req.body.email,
        required: true,
      });
      const password = validateField({
        name: 'password',
        type: String,
        raw: req.body.password,
        required: true,
      });

      try {
        // 2. 로그인 시도
        const tokens = await this.authService.loginTeacher(email, password);
        await addToken(res, tokens);
        res.json({ success: true, data: tokens });
      } catch (error) {
        // 3. Prisma 에러 처리
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          throw new InvalidCredentialsError();
        }
        throw error;
      }
    } catch (error) {
      handleError(error, res);
    }
  }
}
