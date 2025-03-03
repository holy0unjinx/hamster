// src/shared/types/env.d.ts
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production';
    DATABASE_URL: string;
    JWT_SECRET: string;
  }
}

interface ImportMetaEnv {
  readonly PROD: boolean;
}
