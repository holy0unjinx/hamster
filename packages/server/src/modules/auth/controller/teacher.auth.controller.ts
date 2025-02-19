import { Request, Response } from 'express';
import { AuthService } from '../service/auth.service';
import { InvalidInformationError } from '@type/error.type';
import { TeacherRegistrationDto } from '@type/auth.dto';
import { addToken } from './auth.controller';
import { handleError } from '@/shared/utils/handle.utils';

function isTeacherRegistrationDto(body: any): body is TeacherRegistrationDto {
  // 필수 필드 검증
  const hasRequiredFields =
    typeof body.email === 'string' &&
    typeof body.password === 'string' &&
    typeof body.name === 'string';

  // 선택적 필드 검증
  const hasValidTeachersOffice =
    !body.teachersOffice || [1, 2, 3].includes(body.teachersOffice);

  const validHomeroomClasses = [
    11, 12, 13, 14, 15, 16, 17, 21, 22, 23, 24, 25, 26, 31, 32, 33, 34, 35, 36,
  ];

  const hasValidHomeroomClass =
    !body.homeroomClass || validHomeroomClasses.includes(body.homeroomClass);

  // 허용되지 않은 추가 필드가 없는지 확인
  const allowedFields = [
    'email',
    'password',
    'name',
    'subjectId',
    'teachersOffice',
    'homeroomClass',
  ];
  const hasOnlyAllowedFields = Object.keys(body).every((key) =>
    allowedFields.includes(key),
  );

  return (
    hasRequiredFields &&
    hasValidTeachersOffice &&
    hasValidHomeroomClass &&
    hasOnlyAllowedFields
  );
}

export class TeacherAuthController {
  constructor(private authService: AuthService) {}

  async register(req: Request, res: Response) {
    try {
      if (!req.body || !isTeacherRegistrationDto(req.body))
        throw new InvalidInformationError();
      const tokens = await this.authService.registerTeacher(req.body);
      await addToken(res, tokens);
      res.status(201).json({ success: true, data: tokens });
    } catch (error) {
      handleError(error, res);
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const tokens = await this.authService.loginTeacher(email, password);
      await addToken(res, tokens);
      res.json({ success: true, data: tokens });
    } catch (error) {
      handleError(error, res);
    }
  }
}
