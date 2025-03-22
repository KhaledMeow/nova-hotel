import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import "../styles/Dashboard.css";

const Dashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const cancelBooking = async (bookingId) => {
  try { 
    setCancellingId(bookingId);
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/v1/bookings/${bookingId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to cancel booking');
    }

    // Refresh bookings list
    setBookings(prev => prev.filter(b => b._id !== bookingId));
    
  } catch (error) {
    alert(error.message);
    console.error('Cancellation Error:', error);
  } finally {
    setCancellingId(null);
  }
};

// Update the cancel button in the JSX
<button 
  className="cancel-button"

>
  Cancel Booking
</button>

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch('/api/v1/bookings', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('token');
            window.location = '/login';
          }
          throw new Error('Failed to fetch bookings');
        }

        const data = await response.json();
        setBookings(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  if (loading) return <div className="loading-spinner"></div>;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <div className="room-list-page">
    <div className="dashboard-container">
      <h1 className="dashboard-title">Your Bookings</h1>
      {bookings.length === 0 ? (
        <div className="no-bookings">
          <p>You have no upcoming bookings</p>
          <Link to="/room-list" className="book-now-button">
            Book a Room Now
          </Link>
        </div>
      ) : (
        <div className="bookings-grid">
          {bookings.map(booking => (
            <div key={booking._id} className="booking-card">
              <div className="booking-header">
                <h3>{booking.room.name}</h3>
                <span className={`status-badge ${booking.status}`}>
                  {booking.status}
                </span>
              </div>
              
              <div className="booking-dates">
                <div className="date-item">
                  <span>Check-in:</span>
                  {new Date(booking.check_in_date).toLocaleDateString()}
                </div>
                <div className="date-item">
                  <span>Check-out:</span>
                  {new Date(booking.check_out_date).toLocaleDateString()}
                </div>
              </div>

              <div className="booking-details">
                <p>Guests: {booking.num_guests}</p>
                <p>Room Type: {booking.room.type}</p>
                <p>Total Price: ${booking.room.price * 
                  Math.ceil((new Date(booking.check_out_date) - new Date(booking.check_in_date)) / (1000 * 3600 * 24))}</p>
              </div>

              <div className="booking-actions">
                <button className="book-now-button">
                  Cancel Booking
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    </div>
  );
};

export default Dashboard;