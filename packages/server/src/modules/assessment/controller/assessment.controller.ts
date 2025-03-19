import { parseDateString } from '../../../shared/utils/date.utils';
import prisma from '../../../shared/config/database';
import { ROLE } from '../../../shared/types/auth.dto';
import { InvalidQueryError } from '../../../shared/types/error.type';
import { handleError } from '../../../shared/utils/handle.utils';
import { validateRole } from '../../../shared/utils/role.utils';
import { validateField } from '../../../shared/utils/validation.utils';
import { Request, Response } from 'express';

export class AssessmentController {
  constructor() {}
  //TODO: 수행평가 함수 수정
  async checkAssessments(req: Request, res: Response) {
    try {
      if (!req.query.grade && !req.query.class)
        throw new InvalidQueryError(
          'grade 나 class 필드가 작성되지 않았습니다.',
        );
      const assessments = await prisma.assessment.findMany({
        where: {
          grade: parseInt(req.query.grade as string),
          class: parseInt(req.query.class as string),
        },
      });
      res.status(200).json({ success: true, assessments });
    } catch (error) {
      handleError(error, res);
    }
  }

  async addAssessment(req: Request, res: Response) {
    try {
      validateRole(req.user, [ROLE.TEACHER, ROLE.ADMIN]);
      const teacherId = validateField({
        name: 'teacherId',
        type: Number,
        raw: req.body.teacherId,
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
      let grade = validateField({
        name: 'grade',
        type: Number,
        raw: req.body.grade,
      });
      let _class = validateField({
        name: 'class',
        type: Number,
        raw: req.body.class,
      });
      let period = validateField({
        name: 'period',
        type: Number,
        raw: req.body.period,
      });
      let examDate = validateField({
        name: 'examDate',
        type: String,
        raw: req.body.examDate,
      });
      maxScore = parseFloat(maxScore as string);
      const assessment = await prisma.assessment.create({
        data: {
          teacherId,
          title,
          maxScore,
          description,
          grade,
          class: _class,
          period: req.body.period,
          examDate: parseDateString(examDate),
        },
      });
      res.status(201).json({ success: true, assessment });
    } catch (error) {
      handleError(error, res);
    }
  }
}
