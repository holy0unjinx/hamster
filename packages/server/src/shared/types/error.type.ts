export const ErrorCode = {
  // Token Error
  INVALID_TOKEN: 'INVALID_TOKEN', // 잘못된 토큰
  TOKEN_EXPIRED: 'TOKEN_EXPIRED', // 토큰 만료

  // Authentication Error
  UNAUTHORIZED: 'UNAUTHORIZED', // 인증되지 않음
  WRONG_CODE: 'WRONG_CODE', // 잘못된 인증코드
  PERMISSION_DENIED: 'PERMISSION_DENIED', // 권한 부족

  // User Error
  USER_NOT_FOUND: 'USER_NOT_FOUND', // 사용자를 찾지 못함
  USER_ALREADY_EXIST: 'USER_ALREADY_EXIST', // 사용자가 이미 존재함 (가입)
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS', // 잘못된 자격증명 (로그인)
  ACCOUNT_INACTIVE: 'ACCOUNT_INACTIVE', // 계정이 비활성화되어있음

  // Request Error
  INVALID_REQUEST_BODY: 'INVALID_REQUEST_BODY', // 요청 본문이 잘못됨
  INVALID_QUERY: 'INVALID_QUERY',

  NOT_FOUND: 'NOT_FOUND',
  INVALID_DATE_FORMAT: 'INVALID_DATE_FORMAT',
} as const;

export class AppError extends Error {
  public statusCode: number;
  public details: any;

  constructor(
    public code: string,
    status: number,
    message?: string,
    details?: any,
  ) {
    super(message || code);
    this.statusCode = status;
    this.details = details;
  }
}

export class PermissionDeniedError extends AppError {
  constructor(details?: any) {
    super(ErrorCode.PERMISSION_DENIED, 403, '권한이 부족합니다', details);
  }
}

export class InvalidDateFormatError extends AppError {
  constructor(details?: any) {
    super(
      ErrorCode.INVALID_DATE_FORMAT,
      400,
      '잘못된 날짜 형식입니다. [YYYY-MM-DD]',
      details,
    );
  }
}

export class NotFoundError extends AppError {
  constructor(details?: any) {
    super(ErrorCode.NOT_FOUND, 404, '요청 내용을 찾지 못하였습니다.', details);
  }
}

export class InsufficientAuthorityError extends AppError {
  constructor(details?: any) {
    super(ErrorCode.PERMISSION_DENIED, 401, '권한이 부족합니다', details);
  }
}

export class InvalidQueryError extends AppError {
  constructor(details?: any) {
    super(ErrorCode.INVALID_QUERY, 400, '쿼리 내용이 잘못되었습니다.', details);
  }
}

export interface ValidationError {
  field: string;
  expectedType: string;
  actualValue: any;
}

export class InvalidInformationError extends AppError {
  constructor(errors: ValidationError[]) {
    const message = `유효하지 않은 데이터: `;

    super(ErrorCode.INVALID_REQUEST_BODY, 400, message);

    this.details = errors.map((error) => ({
      field: error.field,
      expected_type: error.expectedType,
      actual_value: error.actualValue,
    }));
  }
}

export class WrongCodeError extends AppError {
  constructor() {
    super(ErrorCode.WRONG_CODE, 400, '잘못된 인증코드가 제공되었습니다.');
  }
}

export class InvalidCredentialsError extends AppError {
  constructor() {
    super(
      ErrorCode.INVALID_CREDENTIALS,
      401,
      '잘못된 자격증명입니다.',
      'ID 혹은 비밀번호가 잘못되었습니다.',
    );
  }
}

export class AccountInactiveError extends AppError {
  constructor() {
    super(
      ErrorCode.ACCOUNT_INACTIVE,
      403,
      '계정이 활성화되지 않았습니다.',
      '관리자에게 문의해주세요.',
    );
  }
}

export class UnauthorizedError extends AppError {
  constructor() {
    super(ErrorCode.UNAUTHORIZED, 401, '로그인이 필요한 서비스입니다.');
  }
}

export class UserAlreadyExistError extends AppError {
  constructor() {
    super(ErrorCode.USER_ALREADY_EXIST, 409, '사용자가 이미 존재합니다.');
  }
}

export class InvalidTokenError extends AppError {
  constructor() {
    super(ErrorCode.INVALID_TOKEN, 403, '유효하지 않은 인증 토큰입니다.');
  }
}

export class TokenExpiredError extends AppError {
  constructor() {
    super(
      ErrorCode.TOKEN_EXPIRED,
      401,
      '만료된 토큰입니다.',
      '/refresh 로 요청해주세요.',
    );
  }
}

export class UserNotFoundError extends AppError {
  constructor() {
    super(ErrorCode.USER_NOT_FOUND, 404, '존재하지 않는 사용자 입니다.');
  }
}
