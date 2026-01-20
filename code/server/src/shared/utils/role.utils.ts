import { PermissionDeniedError, UnauthorizedError } from '../types/error.type';

export function validateRole(user: any, allowedRoles: string[]): void {
  // 사용자 존재 여부 확인
  if (!user) throw new UnauthorizedError();

  // 역할 검증
  const isValidated = allowedRoles.includes(user.role);

  if (!isValidated) {
    throw new PermissionDeniedError(
      `다음 권한이 필요합니다: ${allowedRoles.join(', ')} (현재 권한: ${
        user.role
      })`,
    );
  }
}
