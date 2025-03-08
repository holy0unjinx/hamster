import { Request, Response } from 'express';
const express = require('express');
const Timetable = require('comcigan-parser');

const router = express.Router();

const timetable = new Timetable();
let isInitialized = false;

// 초기화 함수
const initialize = async () => {
  if (!isInitialized) {
    await timetable.init();
    isInitialized = true;
    console.log('컴시간 파서 초기화 완료');
  }
};

// 초기화 실행
initialize();

// 학교 검색 API
router.get('/api/schools', async (req: Request, res: Response) => {
  try {
    const { keyword } = req.query;
    if (!keyword) {
      return res.status(400).json({ error: '검색어를 입력해주세요' });
    }

    await initialize();
    const schools = await timetable.search(keyword);
    res.json(schools);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 시간표 조회 API
router.get('/api/timetable', async (req: Request, res: Response) => {
  try {
    const { schoolCode } = req.query;
    if (!schoolCode) {
      return res.status(400).json({ error: '학교 코드를 입력해주세요' });
    }

    await initialize();
    await timetable.setSchool(schoolCode);
    const timetableData = await timetable.getTimetable();
    res.json(timetableData);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 수업 시간 조회 API
router.get('/api/classtime', async (req: Request, res: Response) => {
  try {
    const { schoolCode } = req.query;
    if (!schoolCode) {
      return res.status(400).json({ error: '학교 코드를 입력해주세요' });
    }

    await initialize();
    await timetable.setSchool(schoolCode);
    const classTime = await timetable.getClassTime();
    res.json(classTime);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
export default router;
