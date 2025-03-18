import path from 'path';
import express from 'express';
import router from './src/app';
import {
  httpLogger,
  requestContentMiddleware,
} from './src/shared/middleware/logging.middleware';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';

dotenv.config();
// 환경 변수 기본값을 'production'으로 변경 [5][9]
process.env.NODE_ENV = process.env.NODE_ENV || 'production'; // 수정됨

const app = express();
// 포트 번호를 환경 변수에서 가져오도록 변경 [4][8]
const PORT = process.env.PORT || 3000; // 수정됨

app.use(cookieParser());
app.use(httpLogger);
app.use(requestContentMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// 정적 파일 경로 조정 [6][8]
app.use(express.static(path.join(__dirname, 'public'))); // 수정됨
app.use(
  cors({
    origin: ['https://hamster-client.vercel.app', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  }),
);

app.get('/', (req, res) => {
  res.send('hello');
});
app.use('/api', router);

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`로컬 서버 실행: http://localhost:${PORT}`);
  });
}

export default app;
