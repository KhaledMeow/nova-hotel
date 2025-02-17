import React from "react";
import CalendarComponent from "./CalendarComponent"; // Assuming this is the calendar
import RoomList from "./RoomList"; // Adjusted to use relative path

const CheckAvailability = () => {
  return (
    <div className="check-availability-page">
      {/* Render the Calendar */}
      <CalendarComponent />

      {/* Render the Room List */}
      <RoomList />
    </div>
  );
};

export default CheckAvailability;
