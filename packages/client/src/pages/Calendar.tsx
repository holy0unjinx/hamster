import Badge from '@/components/Badge';
import '../styles/calendar.scss';
import React from 'react';

interface CalendarProps {
  month: number;
  year?: number;
}

function Calendar({ month = 3, year = 2025 }: CalendarProps) {
  const days = ['월', '화', '수', '목', '금'];
  const weeks = Array.from({ length: 6 }, (_, i) => `${i + 1}`);

  const getCalendarDates = () => {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);

    // 첫 번째 월요일 찾기
    let startDate = new Date(firstDay);
    while (startDate.getDay() !== 1) {
      startDate.setDate(startDate.getDate() - 1);
    }

    const calendar = [];
    for (let week = 0; week < 6; week++) {
      const weekDates: Array<{
        date: string;
        isCurrent: boolean;
        isPrev: boolean;
        isNext: boolean;
      }> = [];
      for (let day = 0; day < 5; day++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + week * 7 + day);

        const isCurrentMonth =
          currentDate >= firstDay && currentDate <= lastDay;
        const isPrevMonth = currentDate < firstDay;
        const isNextMonth = currentDate > lastDay;

        weekDates.push({
          date: currentDate.getDate().toString(),
          isCurrent: isCurrentMonth,
          isPrev: isPrevMonth,
          isNext: isNextMonth,
        });
      }
      calendar.push(weekDates);
    }
    return calendar;
  };

  const calendarEvents: { [key: string]: string } = {
    '3': '개학식',
    '7': '수행평가(국어)',
    '12': '중간고사',
    '17': '수학여행',
    '23': '수행평가(과학)',
    '28': '과제제출',
  };

  const calendarData = getCalendarDates();

  return (
    <div className='calendar-component'>
      <div className='header'>
        <div className='date'>세광공업고등학교</div>
        <div className='title'>{`${year}년 ${month}월 학사일정`}</div>
      </div>
      <div className='table-container'>
        {Array.from({ length: (6 + 1) * (5 + 1) }).map((_, index) => {
          const row = Math.floor(index / 6);
          const col = index % 6;

          let originalContent = '';
          let cellClass = 'cell';
          let displayContent: React.ReactNode = '';

          if (row === 0) {
            originalContent = col === 0 ? '' : days[col - 1];
            cellClass += ' header-cell';
          } else if (col === 0) {
            originalContent = weeks[row - 1] || '';
            cellClass += ' week-header';
          } else {
            const dateInfo = calendarData[row - 1]?.[col - 1];
            const date = dateInfo?.date || '';
            const isCurrent = dateInfo?.isCurrent;
            const isOtherMonth = dateInfo?.isPrev || dateInfo?.isNext;

            if (date) {
              cellClass += ' date-cell';
              if (isOtherMonth) cellClass += ' disabled';

              if (isCurrent) {
                const event = calendarEvents[date];
                if (event) {
                  cellClass += ' has-event';
                  const [eventName] = event.split('(');
                  displayContent = (
                    <div className='event-container'>
                      <span className='date-number'>{date}</span>
                      <div className='event-content'>
                        {eventName}
                        {event.includes('수행평가') && (
                          <Badge
                            content='수행평가'
                            background='80, 200, 120, 0.2'
                            size='0.6rem'
                          />
                        )}
                      </div>
                    </div>
                  );
                } else {
                  displayContent = <span className='date-number'>{date}</span>;
                }
              } else {
                displayContent = (
                  <span className='date-number disabled'>{date}</span>
                );
              }
            }
          }

          return (
            <div
              key={index}
              className={cellClass}
              style={{
                gridRow: row + 1,
                gridColumn: col + 1,
              }}
            >
              {displayContent || originalContent}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Calendar;
