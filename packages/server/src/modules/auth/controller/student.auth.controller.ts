import { Request, Response } from 'express';
import { AuthService } from '../service/auth.service';
import { InvalidInformationError, WrongCodeError } from '@type/error.type';
import { StudentRegistrationDto } from '@type/auth.dto';
import { addToken } from './auth.controller';
import { handleAuthError } from '@/shared/utils/handle.utils';

function isStudentRegistrationDto(body: any): body is StudentRegistrationDto {
  return (
    typeof body.studentNumber === 'number' &&
    typeof body.password === 'string' &&
    typeof body.name === 'string' &&
    Object.keys(body).length === 3 // 정확히 3개의 필드만 있는지 확인
  );
}

export class StudentAuthController {
  constructor(private authService: AuthService) {}

  async register(req: Request, res: Response) {
    try {
      if (!req.body || !isStudentRegistrationDto(req.body))
        throw new InvalidInformationError();
      const tokens = await this.authService.registerStudent(req.body);
      await addToken(res, tokens);
      res.status(201).json({ success: true, data: tokens });
    } catch (error) {
      handleAuthError(error, res);
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { studentNumber, password } = req.body;
      const tokens = await this.authService.loginStudent(
        studentNumber,
        password,
      );
      await addToken(res, tokens);
      res.json({ success: true, data: tokens });
    } catch (error) {
      handleAuthError(error, res);
    }
  }

  async activate(req: Request, res: Response) {
    try {
      const { id, activationCode } = req.body;
      if (activationCode !== process.env.ACTIVATION_CODE)
        throw new WrongCodeError();
      await this.authService.activateStudent(id);
      res.json({ success: true });
    } catch (error) {
      handleAuthError(error, res);
    }
  }
}
