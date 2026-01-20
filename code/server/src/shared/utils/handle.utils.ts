import { Response } from 'express';
import {
  AppError,
  InvalidInformationError,
  ValidationError,
} from '../types/error.type';
import { type } from 'os';

export function handleError(error: unknown, res: Response) {
  const message = error instanceof Error ? error.message : '알 수 없는 오류';
  const statusCode = error instanceof AppError ? error.statusCode : 500;
  const errorCode = error instanceof AppError ? error.code : 'UNEXPECTED_ERROR';
  const details = error instanceof AppError ? error.details : '';
  res.status(statusCode).json({
    success: false,
    error: errorCode,
    message: message,
    statusCode: statusCode,
    timestamp: new Date().toISOString(),
    details: details,
  });
}
