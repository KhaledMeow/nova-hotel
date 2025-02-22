import React from "react";
import CalendarComponent from "./CalendarComponent"; 
import RoomList from "./RoomList"; 

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
