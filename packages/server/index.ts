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
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const app = express();
const port = process.env.PORT || 22;

app.use(cookieParser());
app.use(httpLogger);
app.use(requestContentMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

app.use('/api', router);

app.listen(port, () => {
  console.log(`http://localhost:${port}/api 에서 대기중...`);
});

export default app;
