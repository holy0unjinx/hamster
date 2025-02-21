import prisma from '@/shared/config/database';
import { ROLE } from '@/shared/types/auth.dto';
import { InvalidQueryError } from '@/shared/types/error.type';
import { handleError } from '@/shared/utils/handle.utils';
import { validateRole } from '@/shared/utils/role.utils';
import { validateField } from '@/shared/utils/validation.utils';
import { Request, Response } from 'express';

export class AssessmentController {
  constructor() {}
  async checkAssessments(req: Request, res: Response) {
    try {
      if (!req.query.subjectId)
        throw new InvalidQueryError('subjectId 필드가 작성되지 않았습니다.');
      const assessments = await prisma.assessment.findMany({
        where: { subjectId: parseInt(req.query.subjectId as string) },
      });
      res.status(200).json({ success: true, assessments });
    } catch (error) {
      handleError(error, res);
    }
  }

  async addAssessment(req: Request, res: Response) {
    try {
      validateRole(req.user, [ROLE.TEACHER, ROLE.ADMIN]);
      const subjectId = validateField({
        name: 'subjectId',
        type: Number,
        raw: req.body.subjectId,
      });
      const title = validateField({
        name: 'title',
        type: String,
        raw: req.body.title,
      });
      const description = validateField({
        name: 'description',
        type: String,
        raw: req.body.description,
      });
      let maxScore = validateField({
        name: 'maxScore',
        type: String,
        raw: req.body.maxScore,
      });
      maxScore = parseFloat(maxScore as string);
      const assessment = await prisma.assessment.create({
        data: {
          subjectId,
          title,
          maxScore,
          description,
        },
      });
      res.status(201).json({ success: true, assessment });
    } catch (error) {
      handleError(error, res);
    }
  }
}
