import express from 'express';
import { StudentController } from './controller/students.controller';

const router = express.Router();

const studentController = new StudentController();

router.get('/me', studentController.checkOneself);

export default router;
