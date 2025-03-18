import Badge from '@/components/Badge';
import '../styles/calendar.scss';
import React from 'react';

interface CalendarProps {
  month: number;
  year?: number;
  testDate?: Date; // 테스트용 날짜 추가
}

interface CalendarEvent {
  SBTR_DD_SC_NM: string; // 이벤트 유형 (공휴일, 휴업일, 해당없음 등)
  EVENT_NM: string; // 이벤트 이름
  AA_YMD: string; // 이벤트 날짜 (YYYYMMDD 형식)
}

function Calendar({ month = 3, year = 2025, testDate }: CalendarProps) {
  const days = ['월', '화', '수', '목', '금'];
  const weeks = Array.from({ length: 6 }, (_, i) => `${i + 1}`);

  // 테스트 모드인지 확인
  const isTestMode = !!testDate;

  // 새로운 형식으로 데이터 가져오기
  const schoolEvents: CalendarEvent[] = JSON.parse(
    String(localStorage.getItem('calendar')) || '[]',
  );

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
    // YYYYMMDD 형식으로 변환
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const dateString = `${year}${month}${day}`;

    return schoolEvents.find(
      (event: CalendarEvent) => event.AA_YMD === dateString,
    );
  };

  // 현재 날짜 가져오기 (테스트 모드일 경우 testDate 사용)
  const getCurrentDate = () => {
    return isTestMode ? new Date(testDate!) : new Date();
  };

  // 오늘 날짜인지 확인하는 함수
  const isToday = (date: Date) => {
    const today = getCurrentDate();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // 오늘이 토요일인지 확인
  const isSaturday = () => {
    const today = getCurrentDate();
    return today.getDay() === 6; // 토요일은 6
  };

  // 오늘이 일요일인지 확인
  const isSunday = () => {
    const today = getCurrentDate();
    return today.getDay() === 0; // 일요일은 0
  };

  // 다음 주 월요일인지 확인
  const isNextMonday = (date: Date) => {
    const today = getCurrentDate();

    // 오늘이 토요일인 경우, 다음 월요일은 이틀 후
    if (isSaturday()) {
      const nextMonday = new Date(today);
      nextMonday.setDate(today.getDate() + 2);

      return (
        date.getDate() === nextMonday.getDate() &&
        date.getMonth() === nextMonday.getMonth() &&
        date.getFullYear() === nextMonday.getFullYear() &&
        date.getDay() === 1 // 월요일인지 확인
      );
    }

    // 오늘이 일요일인 경우, 다음 월요일은 하루 후
    if (isSunday()) {
      const nextMonday = new Date(today);
      nextMonday.setDate(today.getDate() + 1);

      return (
        date.getDate() === nextMonday.getDate() &&
        date.getMonth() === nextMonday.getMonth() &&
        date.getFullYear() === nextMonday.getFullYear() &&
        date.getDay() === 1 // 월요일인지 확인
      );
    }

    return false;
  };

  const calendarData = getCalendarDates();

  // 테스트 모드 표시
  const renderTestModeInfo = () => {
    if (!isTestMode) return null;

    const testDay = testDate!.getDay();
    const dayNames = [
      '일요일',
      '월요일',
      '화요일',
      '수요일',
      '목요일',
      '금요일',
      '토요일',
    ];

    return (
      <div
        className='test-mode-info'
        style={{
          background: '#f8f9fa',
          padding: '10px',
          marginBottom: '10px',
          borderRadius: '4px',
          border: '1px solid #dee2e6',
        }}
      >
        <strong>테스트 모드:</strong> {testDate!.toLocaleDateString()} (
        {dayNames[testDay]})
      </div>
    );
  };

  // 이벤트 유형에 따른 스타일 클래스 반환
  const getEventTypeClass = (eventType: string) => {
    switch (eventType) {
      case '공휴일':
        return 'holiday-event';
      case '휴업일':
        return 'day-off-event';
      default:
        return '';
    }
  };

  return (
    <div className='calendar-component'>
      <div className='header'>
        <div className='date'>현암중학교</div>
        <div className='title'>{`${year}년 ${month}월 학사일정`}</div>
      </div>

      {renderTestModeInfo()}

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
                const isCurrentDay = isToday(fullDate);
                const isNextMondayAfterWeekend = isNextMonday(fullDate);

                if (isCurrentDay) {
                  cellClass += ' today';
                }

                if (isNextMondayAfterWeekend) {
                  if (isSaturday()) {
                    cellClass += ' today-saturday';
                  } else if (isSunday()) {
                    cellClass += ' today-sunday';
                  }
                }

                if (event) {
                  cellClass += ' has-event';

                  // 이벤트 유형에 따른 클래스 추가
                  cellClass += ` ${getEventTypeClass(event.SBTR_DD_SC_NM)}`;

                  const isAssignment = event.EVENT_NM.includes('수행평가');

                  displayContent = (
                    <div className='event-container'>
                      <span className='date-number'>{date}</span>
                      <div className='event-content'>
                        {event.EVENT_NM}
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
      {isTestMode && (
        <div className='test-tools' style={{ marginTop: '20px' }}>
          <h3>테스트 결과</h3>
          <div>오늘이 토요일인가? {isSaturday() ? '예' : '아니오'}</div>
          <div>오늘이 일요일인가? {isSunday() ? '예' : '아니오'}</div>
        </div>
      )}
    </div>
  );
}

export default Calendar;
