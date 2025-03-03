import Badge from '@/components/Badge';
import '../styles/timetable.scss';
import React from 'react';

function Timetable() {
  const days = ['월', '화', '수', '목', '금'];
  const periods = 7;

  const data = [
    ['', '국어', '수학', '과학', '기술', '가정', '체육', ''],
    ['', '도덕', '영어', '사회', '역사', '진로', '미술', '가정'],
    ['', '기술', '수학', '가정', '국어', '과학 (수행평가)', '', ''],
    ['', '체육', '도덕', '영어', '가정', '역사', '수학', '수학'],
    ['', '국어', '진로', '사회', '기술', '과학', '체육', ''],
  ];

  return (
    <div className='timetable-component'>
      <div className='header'>
        <div className='date'>2025년 1학기</div>
        <div className='title'>시간표 (김솔음)</div>
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
