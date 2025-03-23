import Badge from '@/components/Badge';
import '../styles/timetable.scss';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

/**
 * paste.txt의 내용을 시간표 형식으로 변환하는 함수
 * @param jsonString - paste.txt의 내용 (문자열)
 * @returns 요일별, 교시별로 정리된 시간표 배열
 */
function convertToTimeTable(jsonString: string) {
  if (!jsonString)
    return Array(5)
      .fill([])
      .map(() => Array(7).fill(null));

  try {
    const data = JSON.parse(jsonString);

    // 5일(월~금), 7교시 형태의 2차원 배열 생성
    const result = Array(5)
      .fill(null)
      .map(() => Array(7).fill(null));

    // 데이터 변환
    for (let dayIndex = 0; dayIndex < 5; dayIndex++) {
      // 월~금까지 처리
      const daySchedule = data[dayIndex] || [];

      for (
        let periodIndex = 0;
        periodIndex < daySchedule.length;
        periodIndex++
      ) {
        const period = daySchedule[periodIndex];

        if (period && period.classTime > 0 && period.classTime <= 7) {
          // 1~7교시만 처리
          result[dayIndex][period.classTime - 1] = {
            subject: period.subject,
            teacher: period.teacher,
          };
        }
      }
    }

    return result;
  } catch (error) {
    console.error('시간표 데이터 변환 중 오류 발생:', error);
    return Array(5)
      .fill(null)
      .map(() => Array(7).fill(null));
  }
}

/**
 * 수행평가 정보를 시간표에 적용하는 함수
 * @param timetable - 기본 시간표 데이터
 * @param assessments - 수행평가 데이터 배열
 * @returns 수행평가가 포함된 시간표
 */
function applyAssessmentsToTimetable(timetable: any, assessments: any) {
  if (!assessments || assessments.length === 0) return timetable;

  // 시간표 복사본 생성
  const updatedTimetable = JSON.parse(JSON.stringify(timetable));

  // 각 수행평가에 대해 처리
  assessments.forEach((assessment: any) => {
    const assessmentDate = new Date(assessment.examDate);
    const dayOfWeek = assessmentDate.getDay(); // 0: 일요일, 1: 월요일, ..., 6: 토요일

    // 주말은 제외
    if (dayOfWeek === 0 || dayOfWeek === 6) return;

    const dayIndex = dayOfWeek - 1; // 월요일(1)을 인덱스 0으로 변환
    const periodIndex = assessment.period - 1; // 교시를 0부터 시작하는 인덱스로 변환

    // 유효한 인덱스인지 확인
    if (dayIndex >= 0 && dayIndex < 5 && periodIndex >= 0 && periodIndex < 7) {
      updatedTimetable[dayIndex][periodIndex] = {
        subject: `${assessment.subjectName} (수행평가)`,
        teacher: assessment.teacherName,
        assessmentId: assessment.id,
        assessmentTitle: assessment.title,
        maxScore: assessment.maxScore,
      };
    }
  });

  return updatedTimetable;
}

function Timetable() {
  const days = ['월', '화', '수', '목', '금'];
  const [timetableData, setTimetableData] = useState(
    Array(5)
      .fill(null)
      .map(() => Array(7).fill(null)),
  );

  useEffect(() => {
    // 기본 시간표 데이터 로드
    const basicTimetable = convertToTimeTable(
      localStorage.getItem('timetable')!,
    );

    // 수행평가 데이터 로드
    const assessmentString = localStorage.getItem('assessment');
    if (assessmentString) {
      try {
        const assessmentData = JSON.parse(assessmentString);
        // 수행평가 데이터를 시간표에 적용
        const updatedTimetable = applyAssessmentsToTimetable(
          basicTimetable,
          assessmentData,
        );
        setTimetableData(updatedTimetable);
      } catch (error) {
        console.error('수행평가 데이터 파싱 오류:', error);
        setTimetableData(basicTimetable);
      }
    } else {
      setTimetableData(basicTimetable);
    }
  }, []);

  return (
    <div className='timetable-component'>
      <div className='header'>
        <div className='date'>2025년 1학기</div>
        <div className='title'>시간표 ({localStorage.getItem('name')})</div>
      </div>
      <div className='table-container'>
        {Array.from({ length: 6 * 8 }).map((_, index) => {
          const row = Math.floor(index / 6);
          const col = index % 6;

          let cellClass = 'cell';
          let displayContent: React.ReactNode = '';

          if (row === 0 && col > 0) {
            // 요일 표시
            displayContent = days[col - 1] || '';
          } else if (col === 0 && row > 0) {
            // 교시 표시
            displayContent = row.toString();
          } else if (col > 0 && row > 0) {
            // 과목 정보 표시
            const item = timetableData[col - 1]?.[row - 1];

            if (item && item.subject) {
              cellClass += ' subject';

              // 수행평가 관련 로직
              if (item.subject.includes('(수행평가)')) {
                cellClass += ' assessment';
                const [subjectName] = item.subject.split(' (');
                displayContent = (
                  <Link to={`/assessment/${item.assessmentId}`}>
                    {subjectName}
                    <Badge content={`${item.teacher}T`} />
                    <Badge
                      content='수행평가'
                      background='0, 50, 150, 0.25'
                      size='0.6rem'
                    />
                  </Link>
                );
              } else {
                // 일반 과목 표시 (선생님 이름 Badge에 추가)
                displayContent = (
                  <>
                    {item.subject}
                    {item.teacher &&
                      item.subject !== '스클3' &&
                      item.subject !== '스클2' &&
                      item.subject !== '스클1' &&
                      item.subject !== '주제' && (
                        <Badge content={`${item.teacher}T`} />
                      )}
                  </>
                );
              }
            }
          }

          return (
            <div
              key={index}
              className={cellClass}
              style={{
                ...(index === 0 && {
                  borderTop: 'none',
                  borderLeft: 'none',
                }),
              }}
            >
              {displayContent}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Timetable;
