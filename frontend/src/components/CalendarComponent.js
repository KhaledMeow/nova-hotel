import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // For redirection
import axios from "axios"; // Import axios for API requests
import "E:/React/nova-hotel/frontend/src/styles/Calendar.css";

const CalendarComponent = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [bookedDays, setBookedDays] = useState([]);
  const [availability, setAvailability] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Function to get the number of days in the current month
  const daysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  // Function to get the starting day of the month
  const startOfMonth = () => {
    const date = new Date(currentMonth);
    date.setDate(1);
    return date.getDay();
  };

  // Function to format date to dd-mm-yyyy
  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Handle the date click event
  const handleDateClick = (day) => {
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );

    // Get today's date without time
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (date < today) {
      alert("You cannot select a date before today!");
      return;
    }

    // Check room availability for the selected date
    const dateString = date.toISOString().split('T')[0];
    const dayAvailability = availability[dateString];
    
    if (!dayAvailability || dayAvailability.availableRooms === 0) {
      alert("Sorry, no rooms available for this date!");
      return;
    }

    if (!startDate) {
      setStartDate(date);
    } else if (!endDate && date >= startDate) {
      // Check availability for all dates in the range
      let hasAvailability = true;
      let unavailableDate = null;
      
      for (let checkDate = new Date(startDate); 
           checkDate <= date; 
           checkDate.setDate(checkDate.getDate() + 1)) {
        
        const checkDateString = checkDate.toISOString().split('T')[0];
        const checkAvailability = availability[checkDateString];
        
        if (!checkAvailability || checkAvailability.availableRooms === 0) {
          hasAvailability = false;
          unavailableDate = new Date(checkDate);
          break;
        }
      }

      if (!hasAvailability) {
        alert(`Sorry, no rooms available for ${unavailableDate.toLocaleDateString()}. Please select a different date range.`);
        setStartDate(null); // Reset selection
        return;
      }

      // IMPORTANT: Validate date range
      if (!startDate || !date) {
        alert("Please select both check-in and check-out dates.");
        return;
      }

      // Ensure check-out date is after check-in date
      if (date <= startDate) {
        alert("Check-out date must be after check-in date.");
        return;
      }

      setEndDate(date);

      // Redirect to the RoomList page
      setTimeout(() => {
        const isoStart = startDate.toISOString().split('T')[0];
        const isoEnd = endDate.toISOString().split('T')[0];
        navigate("/room-list", { 
          state: { 
            checkInDate: isoStart, 
            checkOutDate: isoEnd 
          } 
        });
      }, 500);
    } else {
      setStartDate(date);
      setEndDate(null);
    }
  };

  // Check for booked days in the selected date range
  const checkForBookedDays = (start, end) => {
    const startDay = start.getDate();
    const endDay = end.getDate();
    const bookedDaysSet = new Set(bookedDays);

    // Check each day in the range
    for (let day = startDay; day <= endDay; day++) {
      if (bookedDaysSet.has(day)) {
        return true; // There is at least one booked day in the range
      }
    }
    return false; // No booked days in the range
  };

  // Go to the previous month
  const handlePreviousMonth = () => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(newMonth.getMonth() - 1);
      return newMonth;
    });
  };

  // Go to the next month
  const handleNextMonth = () => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(newMonth.getMonth() + 1);
      return newMonth;
    });
  };

  // Function to fetch booked dates from the backend
  const fetchBookedDates = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/v1/bookings');
      const bookings = response.data;

      // Create a Set to store all booked dates
      const bookedDatesSet = new Set();

      bookings.forEach(booking => {
        const start = new Date(startDate);
        const end = new Date(endDate);

        // Add all dates between check-in and check-out
        for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
          if (date.getMonth() === currentMonth.getMonth() &&
              date.getFullYear() === currentMonth.getFullYear()) {
            bookedDatesSet.add(date.getDate());
          }
        }
      });

      setBookedDays(Array.from(bookedDatesSet));
    } catch (error) {
      console.error('Error fetching booked dates:', error);
    }
  };

  // Fetch booked dates when the month changes
  useEffect(() => {
    fetchBookedDates();
  }, [currentMonth]);

  // Function to fetch availability for the current month
  const fetchAvailability = async () => {
    setIsLoading(true);
    try {
      // Get first and last day of current month
      const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
      
      const response = await axios.get(`http://localhost:5000/api/v1/availability?startDate=${firstDay.toISOString()}&endDate=${lastDay.toISOString()}`);
      setAvailability(response.data);
    } catch (error) {
      console.error('Error fetching availability:', error);
    }
    setIsLoading(false);
  };

  // Fetch availability when month changes
  useEffect(() => {
    fetchAvailability();
  }, [currentMonth]);

  // Save selected dates to the backend
  const saveDatesToBackend = async () => {
    if (!startDate || !endDate) {
      console.error('Start and end dates are required');
      return;
    }

    try {
      console.log('Dates saved successfully');
    } catch (error) {
      console.error('Error saving dates:', error.response ? error.response.data : error.message);
    }
  };

  // Render the calendar days
  const renderDays = () => {
    const days = [];
    const totalDays = daysInMonth();
    const startDay = startOfMonth();
    const today = new Date();

    // Add empty cells for the days before the start of the month
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="empty-cell"></div>);
    }

    // Create the day cells
    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        day
      );
      const dateString = date.toISOString().split('T')[0];
      const dayAvailability = availability[dateString];
      
      const isToday = date.toDateString() === today.toDateString();
      const isFullyBooked = dayAvailability && dayAvailability.availableRooms === 0;
      const isSelectedStart =
        startDate && date.toDateString() === startDate.toDateString();
      const isSelectedEnd =
        endDate && date.toDateString() === endDate.toDateString();
      const isPastDay = date < today && !isToday;

      days.push(
        <div
          key={day}
          className={`day-cell ${isToday ? "today" : ""} ${
            isSelectedStart ? "selected-start" : ""
          } ${isSelectedEnd ? "selected-end" : ""} ${
            isPastDay ? "past-day" : ""
          } ${isFullyBooked ? "fully-booked" : ""}`}
          onClick={
            !isFullyBooked && !isPastDay ? () => handleDateClick(day) : undefined
          }
        >
          <span className="day-number">{day}</span>
          {dayAvailability && (
            <span className={`availability ${isFullyBooked ? 'no-rooms' : dayAvailability.availableRooms < 5 ? 'low-rooms' : ''}`}>
              {dayAvailability.availableRooms} rooms
            </span>
          )}
        </div>
      );
    }

    return days;
  };

  // Render the calendar header
  const renderHeader = () => {
    const monthNames = [
      "January", "February", "March", "April", "May", "June", 
      "July", "August", "September", "October", "November", "December"
    ];

    return (
      <div className="calendar-header">
        <button 
          className="nav-button prev-month" 
          onClick={handlePreviousMonth}
        >
          ←
        </button>
        <h2 className="current-month">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h2>
        <button 
          className="nav-button next-month" 
          onClick={handleNextMonth}
        >
          →
        </button>
      </div>
    );
  };

  return (
    <div className="calendar-container">
      {renderHeader()}
      <div className="dateDisplay">
        {startDate && <p>Start date: {formatDate(startDate)}</p>}
        {endDate && <p>End date: {formatDate(endDate)}</p>}
      </div>
      <div className="calendar-grid">
        <div className="day-header">Sun</div>
        <div className="day-header">Mon</div>
        <div className="day-header">Tue</div>
        <div className="day-header">Wed</div>
        <div className="day-header">Thu</div>
        <div className="day-header">Fri</div>
        <div className="day-header">Sat</div>
        {renderDays()}
      </div>
      {startDate && endDate && (
        <div className="booking-confirmation">
          <button 
            onClick={() => {
              saveDatesToBackend();
              navigate("/room-list", { 
                state: { 
                  checkInDate: formatDate(startDate), 
                  checkOutDate: formatDate(endDate) 
                } 
              });
            }}
          >
            Proceed to Booking
          </button>
        </div>
      )}
    </div>
  );
};

export default CalendarComponent;
