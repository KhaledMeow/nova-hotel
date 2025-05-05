import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/RoomList.css";
import "../styles/SweetAlertCustom.css";

const RoomList = ({ isModal, onRoomSelect }) => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await axios.get('/api/v1/rooms');
        setRooms(response.data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);
  

  const handleBookNowClick = async (room) => {
  if (isModal) {
    onRoomSelect(room);
    return;
  }
  const locationState = window.history.state && window.history.state.usr ? window.history.state.usr : {};
  const checkInDate = locationState.checkInDate;
  const checkOutDate = locationState.checkOutDate;
  if (!checkInDate || !checkOutDate) {
    alert('Please select check-in and check-out dates first.');
    return;
  }
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Please login first');
    return navigate('/login');
  }
  try {
    const response = await fetch('/api/v1/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        room: room._id,
        check_in_date: checkInDate,
        check_out_date: checkOutDate,
        num_of_people: 5
      })
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Booking failed');
    }
    const bookingData = await response.json();
    navigate('/Confirm-details', {
      state: {
        room: {
          _id: room._id,
          type: room.type,
          price: room.price
        },
        checkInDate,
        checkOutDate,
        bookingData
      }
    });
  } catch (error) {
    alert(error.message);
    console.error('Booking Error:', error);
  }
};

  if (loading) return <div className="loader"></div>;
  if (error) return <div>{error}</div>;

  return (
    <div className={`room-list-page ${isModal ? 'modal-version' : ''}`}>
      <div className="room-list-container">
        {rooms.map((room) => (
          <div key={room.id} className="room-card">
            <div className="room-image">
              <img src={room.image} alt={room.name} />
            </div>
            <div className="room-info">
              <h2>{room.name}</h2>
              <p>
                <strong>{room.type}</strong>
              </p>
              <ul>
                {room.amenities.map((amenity, idx) => (
                  <li key={idx}>{amenity}</li>
                ))}
              </ul>
              <div className="room-price">
                {(room.type.toLowerCase().includes('penthouse') || 
                  room.type.toLowerCase().includes('family')) ? (
                  <>
                    <span className="original-price">${room.price}</span>
                    <span className="discounted-price">${Math.round(room.price * 0.8)} per night</span>
                    <span className="discount-badge">20% OFF</span>
                  </>
                ) : (
                  <span className="regular-price">${room.price} per night</span>
                )}
              </div>
              <button
                className="book-button"
                onClick={() => handleBookNowClick(room)}
              >
                Book Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoomList;
