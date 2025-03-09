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
 * 시간표 JSON 데이터를 2차원 배열 형태로 변환하는 함수
 * @param timetableData - 원본 시간표 JSON 데이터 (5일 x 여러 교시)
 * @returns 변환된 2차원 배열 시간표 (5일 x 8교시)
 */
function convertToTimeTable(jsonString: string): string[][] {
  // JSON 문자열을 파싱
  const rawData: TimeTableItem[][] = JSON.parse(jsonString);

  // 결과를 저장할 2차원 배열 초기화 (5일 x 8교시)
  const timeTable: string[][] = Array(5)
    .fill(null)
    .map(() => Array(8).fill(''));

  // 각 요일별 데이터 처리
  rawData.forEach((dayData) => {
    dayData.forEach((item) => {
      if (
        item.weekday >= 0 &&
        item.weekday < 5 &&
        item.classTime > 0 &&
        item.classTime <= 8
      ) {
        // 요일(행)과 교시(열)에 맞게 과목명 할당
        // 교시는 1부터 시작하므로 인덱스 조정
        timeTable[item.weekday][item.classTime] = item.subject;
      }
    });
  });

  return timeTable;
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

          let originalContent = '';
          let cellClass = 'cell';
          let displayContent: React.ReactNode = '';

          if (row === 0 && col > 0) {
            originalContent = days[col - 1] || '';
          } else if (col === 0 && row > 0) {
            originalContent = row.toString();
          } else if (col > 0 && row > 0) {
            originalContent = data[col - 1]?.[row] || '';
          }

          // 내용 처리 로직 분리
          if (originalContent) {
            if (col > 0 && row > 0) {
              cellClass += ' subject';

              // 문자열인 경우에만 includes 체크
              if (
                typeof originalContent === 'string' &&
                originalContent.includes('(수행평가)')
              ) {
                cellClass += ' assessment';
                const [subjectName] = originalContent.split(' (');
                displayContent = (
                  <>
                    {subjectName}
                    <Badge
                      content='수행평가'
                      background='0, 50, 150, 0.25'
                      size='0.6rem'
                    />
                  </>
                );
              } else {
                displayContent = originalContent;
              }
            } else {
              displayContent = originalContent;
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
