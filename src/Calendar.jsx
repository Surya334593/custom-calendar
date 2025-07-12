import React, { useState, useEffect } from 'react';
import AppointmentForm from './AppointmentForm';
import { doctors, patients } from './data';

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getStartDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

const Calendar = ({ user, onLogout }) => {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [expandedDate, setExpandedDate] = useState(null);
  const [filterDoctor, setFilterDoctor] = useState('');
  const [filterPatient, setFilterPatient] = useState('');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('dark-mode') === 'true');
  const [pickedDate, setPickedDate] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    document.body.className = darkMode ? 'dark-mode' : '';
    localStorage.setItem('dark-mode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('appointments') || '[]');
    setAppointments(stored);
  }, []);

  useEffect(() => {
    localStorage.setItem('appointments', JSON.stringify(appointments));
  }, [appointments]);

  const daysInMonth = getDaysInMonth(year, month);
  const startDay = getStartDayOfMonth(year, month);

  const isToday = (day) => {
    const now = new Date();
    return (
      day === now.getDate() &&
      month === now.getMonth() &&
      year === now.getFullYear()
    );
  };

  const handleAddOrUpdate = (appt, oldAppt = null) => {
    if (oldAppt) {
      setAppointments(prev => prev.map(a => a === oldAppt ? appt : a));
    } else {
      setAppointments([...appointments, appt]);
    }
    setSelectedDate(null);
    setEditingAppointment(null);
  };

  const handleDelete = (apptToDelete) => {
    setAppointments(prev => prev.filter(a => a !== apptToDelete));
    setSelectedDate(null);
    setEditingAppointment(null);
  };

  const getAppointmentsForDay = (key) => {
    return appointments.filter(a =>
      a.date === key &&
      (!filterDoctor || a.doctor === filterDoctor) &&
      (!filterPatient || a.patient === filterPatient)
    );
  };

  const handleCellClick = (date) => {
    setSelectedDate(date);
    setEditingAppointment(null);
    setPickedDate(date);
    setExpandedDate(null);
  };

  const handleAppointmentClick = (appt) => {
    setSelectedDate(appt.date);
    setEditingAppointment(appt);
    setPickedDate(appt.date);
    setExpandedDate(null);
  };

  const handleDatePick = (e) => {
    const d = new Date(e.target.value);
    if (!isNaN(d)) {
      const dateStr = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
      setMonth(d.getMonth());
      setYear(d.getFullYear());
      setPickedDate(dateStr);
    }
  };

  const renderCalendarCells = () => {
    const cells = [];
    for (let i = 0; i < startDay; i++) {
      cells.push(<div key={`blank-${i}`} className="calendar-cell blank"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const key = `${year}-${month + 1}-${day}`;
      const appts = getAppointmentsForDay(key);

      cells.push(
        <div
          key={key}
          className={`calendar-cell 
            ${isToday(day) ? 'today-cell' : ''} 
            ${pickedDate === key ? 'picked-cell' : ''}`}
          onClick={() => handleCellClick(key)}
        >
          <div className="cell-date">{day}</div>
          {appts.slice(0, 1).map((a, i) => (
            <div
              key={i}
              className="appointment"
              onClick={(e) => {
                e.stopPropagation();
                handleAppointmentClick(a);
              }}
            >
              {a.patient} @ {a.time}
            </div>
          ))}
          {appts.length > 1 && (
            <div
              className="more-appointments"
              onClick={(e) => {
                e.stopPropagation();
                setExpandedDate(key);
              }}
            >
              +{appts.length - 1} more
            </div>
          )}
        </div>
      );
    }

    return cells;
  };

  const jumpToToday = () => {
    const now = new Date();
    setMonth(now.getMonth());
    setYear(now.getFullYear());
    setPickedDate(`${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`);
  };

  const upcomingEvents = [...appointments]
    .filter(a => new Date(a.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5);

  const renderMobile = () => (
    <div className="mobile-calendar">
      <input
        type="date"
        className="mobile-date-picker"
        onChange={handleDatePick}
      />
      {pickedDate && (
        <div className="mobile-day-card">
          <h4>{pickedDate}</h4>
          {getAppointmentsForDay(pickedDate).map((a, i) => (
            <div key={i}>
              <p><strong>{a.patient}</strong> with {a.doctor} at {a.time}</p>
              <button
                className="add-btn"
                onClick={() => handleAppointmentClick(a)}
              >Edit</button>
            </div>
          ))}
          <button
            className="add-btn"
            onClick={() => handleCellClick(pickedDate)}
            style={{ marginTop: '10px' }}
          >Add Appointment</button>
        </div>
      )}
    </div>
  );

  return (
    <div className="calendar-page">
      <div className="calendar-header">
        <div className="header-top">
          <h2 className="welcome-text">Welcome, {user.name}</h2>
          <button className="logout-btn" onClick={onLogout}>Logout</button>
        </div>

        <div className="calendar-controls">
          <button onClick={() => setMonth(month === 0 ? 11 : month - 1)}>◀</button>
          <h3 className="month-title">
            {new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h3>
          <button onClick={() => setMonth(month === 11 ? 0 : month + 1)}>▶</button>
          <button className="today-button" onClick={jumpToToday}>Today</button>
        </div>
      </div>

      <div className="filters">
        <select onChange={(e) => setFilterDoctor(e.target.value)} value={filterDoctor}>
          <option value="">All Doctors</option>
          {doctors.map((d, i) => <option key={i}>{d}</option>)}
        </select>
        <select onChange={(e) => setFilterPatient(e.target.value)} value={filterPatient}>
          <option value="">All Patients</option>
          {patients.map((p, i) => <option key={i}>{p}</option>)}
        </select>
        <input type="date" onChange={handleDatePick} className="date-picker" />
        <button onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? '☀ Light Mode' : '🌙 Dark Mode'}
        </button>
      </div>

      {isMobile ? (
        renderMobile()
      ) : (
        <div className="calendar-grid">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
            <div className="calendar-cell header" key={day}>{day}</div>
          ))}
          {renderCalendarCells()}
        </div>
      )}

      {selectedDate && (
        <div className="form-popup">
          <AppointmentForm
            date={selectedDate}
            onClose={() => {
              setSelectedDate(null);
              setEditingAppointment(null);
            }}
            onSave={handleAddOrUpdate}
            onDelete={handleDelete}
            doctors={doctors}
            patients={patients}
            existingAppointment={editingAppointment}
          />
        </div>
      )}

      {expandedDate && (
        <div className="form-popup scroll-popup">
          <h3 style={{ marginBottom: '10px', color: 'crimson' }}>Appointments on {expandedDate}</h3>
          <div className="scroll-list">
            {appointments
              .filter(a => a.date === expandedDate)
              .map((a, i) => (
                <div key={i} className="scroll-item">
                  <p><strong>{a.patient}</strong> with {a.doctor} at {a.time}</p>
                  <button onClick={() => {
                    setSelectedDate(a.date);
                    setEditingAppointment(a);
                    setExpandedDate(null);
                  }}>
                    Edit
                  </button>
                </div>
              ))}
          </div>
          <button className="cancel-btn" onClick={() => setExpandedDate(null)} style={{ marginTop: '10px' }}>
            Close
          </button>
        </div>
      )}

      <div className="upcoming-events">
        <h3>📅 Upcoming Appointments</h3>
        {upcomingEvents.length === 0 ? (
          <p>No upcoming appointments.</p>
        ) : (
          <ul>
            {upcomingEvents.map((a, i) => (
              <li key={i}>{a.date} - {a.patient} with {a.doctor} @ {a.time}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Calendar;
