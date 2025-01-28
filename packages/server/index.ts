import path from 'path';
import express from 'express';
import logger from 'morgan';
import router from 'src/app';

const app = express();
const port = process.env.PORT || 5173;

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

app.use('/api', router);

app.listen(port, () => {
  console.log(`http://localhost:${port}/api 에서 대기중...`);
});
