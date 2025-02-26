export const checkRoomAvailability = async (roomId, checkIn, checkOut) => {
    const room = await Room.findById(roomId);
    return room.booked_dates.every(booking => {
      return new Date(checkOut) <= booking.startDate || 
             new Date(checkIn) >= booking.endDate;
    });
  };