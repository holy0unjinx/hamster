export class AuthError extends Error {
  public statusCode: number;

  constructor(
    public code:
      | 'AUTH_REQUIRED'
      | 'INVALID_TOKEN'
      | 'TOKEN_EXPIRED'
      | 'USER_NOT_FOUND'
      | 'USER_EXIST'
      | 'INVALID_CREDENTIALS'
      | 'ACCOUNT_INACTIVE'
      | 'AUTHENTICATION_ERROR'
      | 'INSUFFICIENT_AUTHORITY'
      | 'WRONG_CODE'
      | 'INVALID_INFORMATION',
    status: number,
    message?: string,
  ) {
    super(message || code);
    this.statusCode = status;
  }
}

export class InsufficientAuthorityError extends AuthError {
  constructor() {
    super('INSUFFICIENT_AUTHORITY', 401, '권한이 부족합니다');
  }
}

export class InvalidInformationError extends AuthError {
  constructor() {
    super('INVALID_INFORMATION', 400, '잘못된 정보가 제공되었습니다.');
  }
}

export class WrongCodeError extends AuthError {
  constructor() {
    super('WRONG_CODE', 400, '잘못된 코드가 제공되었습니다.');
  }
}

export class InvalidCredentialsError extends AuthError {
  constructor() {
    super('INVALID_CREDENTIALS', 401, '잘못된 자격증명입니다.');
  }
}

export class AccountInactiveError extends AuthError {
  constructor() {
    super(
      'ACCOUNT_INACTIVE',
      403,
      '계정이 활성화되지 않았습니다. 관리자에게 문의해주세요',
    );
  }
}

export class AuthRequiredError extends AuthError {
  constructor() {
    super('AUTH_REQUIRED', 401, '로그인이 필요한 서비스입니다.');
  }
}

export class UserExistError extends AuthError {
  constructor() {
    super('USER_EXIST', 409, '사용자가 이미 존재합니다.');
  }
}

export class InvalidTokenError extends AuthError {
  constructor() {
    super('INVALID_TOKEN', 403, '유효하지 않은 인증 토큰입니다.');
  }
}

export class TokenExpiredError extends AuthError {
  constructor() {
    super('TOKEN_EXPIRED', 401, '만료된 토큰입니다.');
  }
}

export class UserNotFoundError extends AuthError {
  constructor() {
    super('USER_NOT_FOUND', 404, '존재하지 않는 사용자 입니다.');
  }
}

export class AuthenticationError extends AuthError {
  constructor(message: string) {
    super('AUTHENTICATION_ERROR', 401, message);
  }
}
