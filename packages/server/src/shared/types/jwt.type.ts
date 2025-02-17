export interface Payload {
  id: number;
  role: 'student' | 'teacher' | 'john';
}

export interface Token {
  accessToken: string;
  refreshToken: string;
}
