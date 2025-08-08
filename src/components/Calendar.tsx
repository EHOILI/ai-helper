import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../contexts/AppContext';
import { useNavigate } from 'react-router-dom'; // useNavigate 임포트

interface CalendarEvent {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
}

function Calendar() {
  const context = useContext(AppContext);
  const navigate = useNavigate(); // useNavigate 훅 사용

  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState('');

  if (!context) {
    return <div>Loading...</div>;
  }
  const { calendarEvents, addCalendarEvent } = context;

  const handleAddEvent = () => {
    if (newEventTitle.trim() === '' || newEventDate.trim() === '') {
      alert('제목과 날짜를 모두 입력해주세요.');
      return;
    }
    const newEvent: CalendarEvent = {
      id: Date.now().toString(),
      date: newEventDate,
      title: newEventTitle,
    };
    addCalendarEvent({ date: newEventDate, title: newEventTitle });
    setNewEventTitle('');
    setNewEventDate('');
  };

  // 날짜별로 이벤트를 그룹화
  const groupedEvents = calendarEvents.reduce((acc, event) => {
    const date = event.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(event);
    return acc;
  }, {} as { [key: string]: CalendarEvent[] });

  const sortedDates = Object.keys(groupedEvents).sort();

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <h1 className="ai-assistant">일정 관리</h1>
        <button onClick={() => navigate('/')} className="ai-assistant">나가기</button>
      </div>
      <div className="add-event">
        <input
          type="text"
          placeholder="이벤트 제목"
          value={newEventTitle}
          onChange={(e) => setNewEventTitle(e.target.value)}
        />
        <input
          type="date"
          value={newEventDate}
          onChange={(e) => setNewEventDate(e.target.value)}
        />
        <button onClick={handleAddEvent}>이벤트 추가</button>
      </div>
      <div className="event-list">
        {sortedDates.length === 0 ? (
          <p>등록된 일정이 없습니다.</p>
        ) : (
          sortedDates.map(date => (
            <div key={date} className="date-group">
              <h3>{date}</h3>
              {groupedEvents[date].map(event => (
                <div key={event.id} className="event-item">
                  <span>{event.title}</span>
                  {/* 삭제 기능은 AppContext에 추가해야 합니다. */}
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Calendar;