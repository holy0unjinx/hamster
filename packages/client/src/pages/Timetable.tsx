import Badge from '@/components/Badge';
import '../styles/timetable.scss';
import React from 'react';

/**
 * 시간표 항목의 인터페이스 정의
 */
interface TimeTableItem {
  grade: number;
  class: number;
  weekday: number;
  weekdayString: string;
  classTime: number;
  teacher: string;
  subject: string;
}

/**
 * paste.txt의 내용을 시간표 형식으로 변환하는 함수
 * @param jsonString - paste.txt의 내용 (문자열)
 * @returns 요일별, 교시별로 정리된 시간표 배열
 */
function convertToTimeTable(jsonString: string) {
  try {
    // 문자열을 JSON으로 파싱
    const parsedData = JSON.parse(jsonString);

    // 학년, 반 정보 가져오기 (localStorage에서 설정된 값 사용 가정)
    const grade = localStorage.getItem('grade') || '1';
    const classNum = localStorage.getItem('class') || '1';

    // 해당 학년, 반의 시간표 데이터 가져오기
    const classData = parsedData[grade]?.[classNum];

    if (!classData) {
      console.error('시간표 데이터를 찾을 수 없습니다.');
      return Array(5).fill(Array(7).fill(null));
    }

    // 요일별로 정리된 시간표 생성 (5일 x 7교시)
    const timetable = Array(5)
      .fill(null)
      .map(() => Array(7).fill(null));

    // 각 요일별 데이터 처리
    classData.forEach((dayData: any, dayIndex: any) => {
      // 각 교시별 데이터 처리 (7교시까지만)
      for (let periodIndex = 0; periodIndex < 7; periodIndex++) {
        const lessonData = dayData[periodIndex];

        // 수업 데이터가 있고 과목명이 있는 경우에만 추가
        if (lessonData && lessonData.subject) {
          timetable[dayIndex][periodIndex] = {
            subject: lessonData.subject,
            teacher: lessonData.teacher || '',
            weekday: lessonData.weekday,
            classTime: lessonData.classTime,
          };
        }
      }
    });

    return timetable;
  } catch (error) {
    console.error('시간표 변환 중 오류가 발생했습니다:', error);
    // 오류 발생 시 빈 시간표 반환
    return Array(5).fill(Array(7).fill(null));
  }
}

function Timetable() {
  const days = ['월', '화', '수', '목', '금'];
  const periods = 7;
  const data = convertToTimeTable(localStorage.getItem('timetable')!);

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
            const item = data[col - 1]?.[row - 1];

            if (item && item.subject) {
              cellClass += ' subject';

              // 수행평가 관련 로직 (기존 코드 유지)
              if (item.subject.includes('(수행평가)')) {
                cellClass += ' assessment';
                const [subjectName] = item.subject.split(' (');
                displayContent = (
                  <>
                    {subjectName}
                    <Badge content={item.teacher} />
                    <Badge
                      content='수행평가'
                      background='0, 50, 150, 0.25'
                      size='0.6rem'
                    />
                  </>
                );
              } else {
                // 일반 과목 표시 (선생님 이름 Badge에 추가)
                displayContent = (
                  <>
                    {item.subject}
                    <Badge content={item.teacher} />
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
