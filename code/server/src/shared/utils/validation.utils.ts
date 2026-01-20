import { InvalidInformationError } from '../types/error.type';

interface ValidationFields {
  raw: any;
  type: NumberConstructor | StringConstructor | BooleanConstructor;
  required?: boolean;
  onValidate?: (value: any) => boolean;
  name: string;
}

export function validateField(field: ValidationFields): any {
  const { raw, type, required = true, onValidate, name } = field;

  // required 체크
  if (required && (raw === undefined || raw === null)) {
    throw new InvalidInformationError([
      {
        field: name,
        expectedType: type.name,
        actualValue: raw,
      },
    ]);
  }

  // undefined/null 처리
  if (raw === undefined || raw === null) {
    return raw;
  }

  // 타입 체크 및 변환
  let value: any = raw;

  if (type === Number) {
    value = Number(raw);
    if (isNaN(value)) {
      throw new InvalidInformationError([
        {
          field: name,
          expectedType: type.name,
          actualValue: raw,
        },
      ]);
    }
  } else if (type === String) {
    value = String(raw);
  } else if (type === Boolean) {
    value = Boolean(raw);
  }

  // 커스텀 검증
  if (onValidate && !onValidate(value)) {
    throw new InvalidInformationError([
      {
        field: name,
        expectedType: `Custom validation for ${name}`,
        actualValue: value,
      },
    ]);
  }

  return value;
}
