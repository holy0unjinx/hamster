import { InvalidDateFormatError } from '../types/error.type';

export function parseDateString(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);

  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    throw new InvalidDateFormatError();
  }

  return new Date(year, month - 1, day);
}
