export const checkRoomAvailability = async (room, checkIn, checkOut) => {
    const room = await Room.findById(room);
    return room.booked_dates.every(booking => {
      return new Date(checkOut) <= booking.startDate || 
             new Date(checkIn) >= booking.endDate;
    });
  };