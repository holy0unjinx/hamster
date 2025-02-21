import prisma from '@/shared/config/database';
import { ROLE } from '@/shared/types/auth.dto';
import { handleError } from '@/shared/utils/handle.utils';
import { validateRole } from '@/shared/utils/role.utils';
import { validateField } from '@/shared/utils/validation.utils';
import { Request, Response } from 'express';

export class SubjectController {
  constructor() {}
  async checkSubjects(req: Request, res: Response) {
    try {
      const grade = req.query.grade
        ? parseInt(req.query.grade as string)
        : null;

      const subjects = await prisma.subject.findMany({
        where: grade ? { grade } : undefined,
      });

      res.status(200).json({
        success: true,
        subjects,
      });
    } catch (error) {
      handleError(error, res);
    }
  }

  async addSubject(req: Request, res: Response) {
    try {
      const subjectName = validateField({
        name: 'subjectName',
        raw: req.body.subjectName,
        type: String,
        onValidate: (name) => {
          return name.length < 10;
        },
      });
      const grade = validateField({
        name: 'grade',
        raw: req.body.grade,
        type: Number,
      });
      const subject = await prisma.subject.create({
        data: { subjectName, grade },
      });
      res.status(201).json({ success: true, subject });
    } catch (error) {
      handleError(error, res);
    }
  }
}
