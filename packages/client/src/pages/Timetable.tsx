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

//TODO: 수행평가 확인 함수 작성

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
                    <Badge content={`${item.teacher}■`} />
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
