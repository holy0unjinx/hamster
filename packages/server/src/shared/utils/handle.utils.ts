import { Response } from 'express';
import { AuthError } from '../types/error.type';

export function handleAuthError(error: unknown, res: Response) {
  const message = error instanceof Error ? error.message : '알 수 없는 오류';
  const statusCode = error instanceof AuthError ? error.statusCode : 500;
  const errorCode =
    error instanceof AuthError ? error.code : 'UNEXPECTED_ERROR';
  res
    .status(statusCode)
    .json({ success: false, error: errorCode, message: message });
}

export function handleError(error: unknown, res: Response) {
  const message = error instanceof Error ? error.message : '알 수 없는 오류';
  const statusCode = 500;
  const errorCode = 'UNEXPECTED_ERROR';
  res
    .status(statusCode)
    .json({ success: false, error: errorCode, message: message });
}
