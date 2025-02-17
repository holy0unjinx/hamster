export interface RegistrationDto {
  identifier: string;
  password: string;
  role: 'student' | 'teacher' | 'john';
  name: string;

  grade?: number;
  class?: number;
  number?: number;
  guardianContact?: string;

  subject?: string;
  officeLocation?: string;
  hoomroomClass?: string;
}

export interface LoginDto {
  identifier: string;
  password: string;
}
