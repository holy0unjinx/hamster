import Badge from '@/components/Badge';
import '../styles/calendar.scss';
import React, { useEffect, useState } from 'react';

interface CalendarProps {
  month: number;
  year?: number;
}

interface ScheduleEvent {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
}

function Calendar({ month = 3, year = 2025 }: CalendarProps) {
  const days = ['월', '화', '수', '목', '금'];
  const weeks = Array.from({ length: 6 }, (_, i) => `${i + 1}`);
  const [scheduleEvents, setScheduleEvents] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchScheduleData = async () => {
      try {
        // 해당 월의 첫날과 마지막날 계산
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        // API 요청 URL 생성
        const formattedStartDate = startDate.toISOString().split('T')[0];
        const formattedEndDate = endDate.toISOString().split('T')[0];
        const url = `https://hamster-server.vercel.app/api/v1/schedule?startDate=${formattedStartDate}&endDate=${formattedEndDate}`;

        const response = await fetch(url);
        const result = await response.json();

        if (result.success) {
          setScheduleEvents(result.data);
        } else {
          console.error('일정 데이터를 가져오는데 실패했습니다.');
        }
      } catch (error) {
        console.error('API 요청 중 오류 발생:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchScheduleData();
  }, [month, year]);

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
        fullDate: Date;
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
          fullDate: new Date(currentDate),
          isCurrent: isCurrentMonth,
          isPrev: isPrevMonth,
          isNext: isNextMonth,
        });
      }
      calendar.push(weekDates);
    }
    return calendar;
  };

  // 날짜에 해당하는 이벤트 찾기
  const getEventForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return scheduleEvents.find((event) => {
      const eventStartDate = new Date(event.startDate)
        .toISOString()
        .split('T')[0];
      const eventEndDate = new Date(event.endDate).toISOString().split('T')[0];

      // 날짜가 이벤트 기간 내에 있는지 확인
      return dateString >= eventStartDate && dateString <= eventEndDate;
    });
  };

  const calendarData = getCalendarDates();

  return (
    <div className='calendar-component'>
      <div className='header'>
        <div className='date'>현암중학교</div>
        <div className='title'>{`${year}년 ${month}월 학사일정`}</div>
      </div>
      <div className='table-container'>
        {loading ? (
          <div className='loading'>일정을 불러오는 중...</div>
        ) : (
          Array.from({ length: (6 + 1) * (5 + 1) }).map((_, index) => {
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
              if (!dateInfo) return null;

              const date = dateInfo.date;
              const fullDate = dateInfo.fullDate;
              const isCurrent = dateInfo.isCurrent;
              const isOtherMonth = dateInfo.isPrev || dateInfo.isNext;

              if (date) {
                cellClass += ' date-cell';
                if (isOtherMonth) cellClass += ' disabled';

                if (isCurrent) {
                  const event = getEventForDate(fullDate);

                  if (event) {
                    cellClass += ' has-event';
                    const isAssignment = event.title.includes('수행평가');

                    displayContent = (
                      <div className='event-container'>
                        <span className='date-number'>{date}</span>
                        <div className='event-content'>
                          {event.title}
                          {isAssignment && (
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
                    displayContent = (
                      <span className='date-number'>{date}</span>
                    );
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
          })
        )}
      </div>
    </div>
  );
}

export default Calendar;
