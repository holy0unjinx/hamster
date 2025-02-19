export interface StudentRegistrationDto {
  studentNumber: number;
  password: string;
  name: string;
}

export interface TeacherRegistrationDto {
  email: string;
  password: string;
  name: string;
  subjectId: number;
  teachersOffice?: 1 | 2 | 3;
  homeroomClass?:
    | 11
    | 12
    | 13
    | 14
    | 15
    | 16
    | 17
    | 21
    | 22
    | 23
    | 24
    | 25
    | 26
    | 31
    | 32
    | 33
    | 34
    | 35
    | 36;
}

export interface LoginDto {
  identifier: string;
  password: string;
}
