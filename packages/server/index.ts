import path from 'path';
import express from 'express';
import router from './src/app';
import {
  httpLogger,
  requestContentMiddleware,
} from './src/shared/middleware/logging.middleware';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

dotenv.config();
// 환경 변수 기본값을 'production'으로 변경 [5][9]
process.env.NODE_ENV = process.env.NODE_ENV || 'production'; // 수정됨

const app = express();
// 포트 번호를 환경 변수에서 가져오도록 변경 [4][8]
const port = process.env.PORT || 443; // 수정됨

app.use(cookieParser());
app.use(httpLogger);
app.use(requestContentMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// 정적 파일 경로 조정 [6][8]
app.use(express.static(path.join(__dirname, 'public'))); // 수정됨

app.use('/', (req, res) => {
  res.send('hello');
});
app.use('/api', router);

app.listen(port, () => {
  console.log(`http://localhost:${port}/api 에서 대기중...`);
});

export default app;
