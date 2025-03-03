import { Request, Response } from 'express';
import {
  InsufficientAuthorityError,
  InvalidDateFormatError,
  NotFoundError,
} from '../../../shared/types/error.type';
import { handleError } from '../../../shared/utils/handle.utils';
import prisma from '../../../shared/config/database';
import { validateRole } from '../../../shared/utils/role.utils';
import { ROLE } from '../../../shared/types/auth.dto';
import { validateField } from '../../../shared/utils/validation.utils';
import { parseDateString } from '../../../shared/utils/date.utils';

export class ScheduleController {
  async addSchedule(req: Request, res: Response) {
    try {
      validateRole(req.user, [ROLE.TEACHER, ROLE.ADMIN]);
      const title = validateField({
        name: 'title',
        type: String,
        raw: req.body.title,
        onValidate: (title) => {
          return title.length > 2 && title.length < 50;
        },
      });
      const description = validateField({
        name: 'description',
        type: String,
        raw: req.body.description,
        required: false,
      });
      const startDate = validateField({
        name: 'startDate',
        type: String,
        raw: req.body.startDate,
      });
      const endDate = validateField({
        name: 'endDate',
        type: String,
        raw: req.body.endDate,
      });

      const schedule = await prisma.schedule.create({
        data: {
          title,
          description,
          startDate: parseDateString(startDate),
          endDate: parseDateString(endDate),
        },
      });

      res.status(201).json({
        success: true,
        data: schedule,
      });
    } catch (error) {
      handleError(error, res);
    }
  }

  async checkSchedule(req: Request, res: Response) {
    try {
      const defaultStartDate = '2025-01-01';
      const defaultEndDate = '2025-12-31';

      const startDate = parseDateString(
        (req.query.startDate as string) || defaultStartDate,
      );
      const endDate = parseDateString(
        (req.query.endDate as string) || defaultEndDate,
      );

      const schedules = await prisma.schedule.findMany({
        where: {
          startDate: { gte: startDate },
          endDate: { lte: endDate },
        },
        orderBy: {
          startDate: 'asc',
        },
        select: {
          id: true,
          title: true,
          description: true,
          startDate: true,
          endDate: true,
        },
      });

      res.status(200).json({
        success: true,
        data: schedules,
      });
    } catch (error) {
      handleError(error, res);
    }
  }

  async removeSchedule(req: Request, res: Response) {
    try {
      validateRole(req.user, [ROLE.TEACHER, ROLE.ADMIN]);

      const id = validateField({
        name: 'id',
        type: Number,
        raw: req.body.id,
      });

      const schedule = await prisma.schedule.findUnique({
        where: { id },
      });

      if (!schedule) {
        throw new NotFoundError('삭제할 일정을 찾을 수 없습니다.');
      }

      await prisma.schedule.delete({
        where: { id },
      });

      res.status(200).json({
        success: true,
        message: '일정이 성공적으로 삭제되었습니다.',
      });
    } catch (error) {
      handleError(error, res);
    }
  }
}
