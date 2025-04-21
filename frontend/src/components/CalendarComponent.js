import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "E:/React/nova-hotel/frontend/src/styles/Calendar.css";

const CalendarComponent = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [availability, setAvailability] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const daysInMonth = () => new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();

  const startOfMonth = () => new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();

  useEffect(() => {
    const source = axios.CancelToken.source();
    
    const fetchAvailability = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await axios.get("/api/v1/rooms/availability", {
          params: {
            month: currentMonth.getMonth() + 1,
            year: currentMonth.getFullYear()
          },
          cancelToken: source.token
        });

        setAvailability(response.data);
      } catch (err) {
        if (!axios.isCancel(err)) {
          setError("Failed to load availability data");
          console.error("Fetch error:", err);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvailability();

    return () => source.cancel("Component unmounted");
  }, [currentMonth]);


  const handleDateClick = (day) => {
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateString = date.toISOString().split("T")[0];
    const dayAvailability = availability[dateString] || { available: false, count: 0 };

    if (date < today) {
      console.log("Cannot select past dates");
      return;
    }

    if (!dayAvailability.available) {
      console.log("No rooms available for this date");
      return;
    }

    if (!startDate || (startDate && endDate)) {
      setStartDate(date);
      setEndDate(null);
    } else if (date > startDate) {
      let allAvailable = true;
      const current = new Date(startDate);
      
      while (current <= date) {
        const checkDateStr = current.toISOString().split("T")[0];
        if (!(availability[checkDateStr]?.available ?? false)) {
          allAvailable = false;
          break;
        }
        current.setDate(current.getDate() + 1);
      }

      if (allAvailable) {
        setEndDate(date);
      } else {
        console.log("Some dates in this range are unavailable");
        setStartDate(null);
        setEndDate(null);
      }
    }
  };


  const renderDays = () => {
    const totalDays = daysInMonth();
    const startDay = startOfMonth();
    const today = new Date();
    const days = [];


    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="empty-cell" />);
    }

    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const dateString = date.toISOString().split("T")[0];
      const { available, count = 0 } = availability[dateString] || {};
      const isToday = date.toDateString() === today.toDateString();
      const isSelectedStart = startDate?.toDateString() === date.toDateString();
      const isSelectedEnd = endDate?.toDateString() === date.toDateString();
      const isInRange = startDate && endDate && date > startDate && date < endDate;

      days.push(
        <div
          key={day}
          className={`day-cell 
            ${isToday ? "today" : ""}
            ${isSelectedStart ? "selected-start" : ""}
            ${isSelectedEnd ? "selected-end" : ""}
            ${isInRange ? "selected-range" : ""}
            ${!available ? "unavailable" : ""}`}
          onClick={() => available && handleDateClick(day)}
        >
          <div className="day-number">{day}</div>
          {available && (
            <div className={`availability ${count < 3 ? "low-availability" : ""}`}>
              {count} left
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  return (
    <div className="calendar-container">
      {error && (
        <div className="error-banner">
          {error} - <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      )}

      <div className="calendar-header">
        <button onClick={() => setCurrentMonth(prev => {
          const newDate = new Date(prev);
          newDate.setMonth(prev.getMonth() - 1);
          return newDate;
        })}>
          ←
        </button>
        
        <h2>
          {currentMonth.toLocaleString("default", {
            month: "long",
            year: "numeric"
          })}
        </h2>

        <button onClick={() => setCurrentMonth(prev => {
          const newDate = new Date(prev);
          newDate.setMonth(prev.getMonth() + 1);
          return newDate;
        })}>
          →
        </button>
      </div>

      {isLoading && (
        <div className="loading-overlay">
          <div className="loader" />
          <p>Loading availability...</p>
        </div>
      )}

      <div className="calendar-grid">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
          <div key={day} className="day-header">{day}</div>
        ))}
        {renderDays()}
      </div>

      {startDate && endDate && (
        <div className="booking-actions">
          <button
            onClick={() => navigate("/room-list", {
              state: {
                checkInDate: startDate.toISOString().split("T")[0],
                checkOutDate: endDate.toISOString().split("T")[0]
              }
            })}
          >
            View Available Rooms
          </button>
        </div>
      )}
    </div>
  );
};

export default CalendarComponent;