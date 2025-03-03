import { Request, Response } from 'express';
import { AuthService } from '../service/auth.service';
import {
  InvalidInformationError,
  WrongCodeError,
} from '../../../shared/types/error.type';
import { addToken } from './auth.controller';
import { handleError } from '../../../shared/utils/handle.utils';
import { validateField } from '../../../shared/utils/validation.utils';

export class StudentAuthController {
  constructor(private authService: AuthService) {}

  async register(req: Request, res: Response) {
    try {
      const studentNumber = validateField({
        name: 'studentNumber',
        type: Number,
        raw: req.body.studentNumber,
      });
      const password = validateField({
        name: 'password',
        type: String,
        raw: req.body.password,
      });
      const name = validateField({
        name: 'name',
        type: String,
        raw: req.body.name,
        onValidate: (name) => {
          return name.length > 1 || name.length < 6;
        },
      });
      const tokens = await this.authService.registerStudent({
        studentNumber,
        password,
        name,
      });
      await addToken(res, tokens);
      res.status(201).json({ success: true, data: tokens });
    } catch (error) {
      handleError(error, res);
    }
  }

  async login(req: Request, res: Response) {
    try {
      const studentNumber = validateField({
        name: 'studentNumber',
        type: Number,
        raw: req.body.studentNumber,
      });
      const password = validateField({
        name: 'password',
        type: String,
        raw: req.body.password,
      });
      const tokens = await this.authService.loginStudent(
        studentNumber,
        password,
      );
      await addToken(res, tokens);
      res.json({ success: true, data: tokens });
    } catch (error) {
      handleError(error, res);
    }
  }

  async activate(req: Request, res: Response) {
    try {
      const id = validateField({
        name: 'id',
        type: Number,
        raw: req.body.id,
      });
      const activationCode = validateField({
        name: 'activationCode',
        type: String,
        raw: req.body.activationCode,
      });
      if (activationCode !== process.env.ACTIVATION_CODE)
        throw new WrongCodeError();
      await this.authService.activateStudent(id);
      res.json({ success: true });
    } catch (error) {
      handleError(error, res);
    }
  }
}
