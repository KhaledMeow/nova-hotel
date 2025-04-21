import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import jwtDecode from 'jwt-decode';
import "../styles/Dashboard.css";

const Dashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [confirmingId, setConfirmingId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isStaff, setIsStaff] = useState(false);
  const [payments, setPayments] = useState([]);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          window.location = '/login';
          return;
        }

        const decoded = jwtDecode(token);
        setIsAdmin(decoded.role === 'admin');
        setIsStaff(decoded.role === 'staff');
        const currentUserId = decoded.userId || decoded._id || decoded.id; // fallback for userId
        window._novaUserRole = decoded.role;
        window._novaUserId = currentUserId;

        const [bookingsRes, complaintsRes, paymentsRes] = await Promise.all([
          fetch('/api/v1/bookings', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('/api/v1/complaints', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('/api/v1/payments', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);

        if (!bookingsRes.ok) {
          if (bookingsRes.status === 401) {
            localStorage.removeItem('token');
            window.location = '/login';
          }
          throw new Error('Failed to fetch bookings');
        }

        if (!complaintsRes.ok) {
          throw new Error('Failed to fetch complaints');
        }

        if (!paymentsRes.ok) {
          throw new Error('Failed to fetch payments');
        }

        const bookingsData = await bookingsRes.json();
        const complaintsData = await complaintsRes.json();
        const paymentsData = await paymentsRes.json();

        setBookings(bookingsData);
        setComplaints(complaintsData);
        setPayments(paymentsData);
        
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const cancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try { 
      setCancellingId(bookingId);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to cancel booking');
      }

      setBookings(prev => prev.map(b => 
        b._id === bookingId ? { ...b, status: 'cancelled' } : b
      ));
      
    } catch (error) {
      alert(error.message);
      console.error('Cancellation Error:', error);
    } finally {
      setCancellingId(null);
    }
  };

  const confirmBooking = async (bookingId) => {
    if (!window.confirm('Confirm this booking?')) return;
    try {
      setConfirmingId(bookingId);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/bookings/${bookingId}/confirm`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Booking already confirmed');
      
      setBookings(prev => prev.map(b => 
        b._id === bookingId ? { ...b, status: 'confirmed' } : b
      ));
    } catch (error) {
      alert(error.message);
    } finally {
      setConfirmingId(null);
    }
  };
  const solveComplaint = async (complaintId) => {
    if (!window.confirm('Mark this complaint as solved?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/complaints/${complaintId}/solve`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to solve complaint');
      }
  
      // Update local state
      setComplaints(prev => prev.map(c => 
        c._id === complaintId ? { ...c, status: 'solved' } : c
      ));
      
    } catch (error) {
      alert(error.message);
      console.error('Solve Complaint Error:', error);
    }
  };
  const inProgressComplaint = async (complaintId) => {
    if (!window.confirm('Mark this complaint as in progress?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/complaints/${complaintId}/in-progress`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to mark complaint as in progress');
      }
  
      // Update local state
      setComplaints(prev => prev.map(c => 
        c._id === complaintId ? { ...c, status: 'in progress' } : c
      ));
      
    } catch (error) {
      alert(error.message);
      console.error('In Progress Complaint Error:', error);
    }
  };
  const completePayment = async (paymentId) => {
    if (!window.confirm('Mark this payment as completed?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/payments/${paymentId}/complete`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to complete payment');
      }
  
      // Update local state
      setPayments(prev => prev.map(p => 
        p._id === paymentId ? { ...p, status: 'completed' } : p
      ));
      
    } catch (error) {
      alert(error.message);
      console.error('Complete Payment Error:', error);
    }
  };
  const refundPayment = async (paymentId) => {
    if (!window.confirm('Mark this payment as refunded?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/payments/${paymentId}/refund`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to refund payment');
      }
  
      // Update local state
      setPayments(prev => prev.map(p => 
        p._id === paymentId ? { ...p, status: 'refunded' } : p
      ));
      
    } catch (error) {
      alert(error.message);
      console.error('Refund Payment Error:', error);
    }
  };
  // Update the button in complaints section to:
  <div className="booking-actions">
    {(isAdmin || isStaff) && complaint.status !== 'solved' && (
      <button 
        className="solved-button"
        onClick={() => solveComplaint(complaint._id)}
      >
        Mark as Solved
      </button>
    )}
  </div>
  useEffect(() => {
    console.log('Bookings:', bookings);
    console.log('Current user role:', isAdmin ? 'Admin' : isStaff ? 'Staff' : 'Guest');
  }, [bookings, isAdmin, isStaff]);


  if (loading) return <div className="loading-spinner"></div>;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <div className="room-list-page">
      <div className="dashboard-container">
        <h1 className="dashboard-title" style={{ marginTop: '3rem' }}>Bookings</h1>
         {bookings.length === 0 ? (
          <div className="no-bookings">
            <p>You have no upcoming bookings</p>
            <Link to="/calendar" className="book-now-button">
              Book Now
            </Link>
          </div>
        ) : (
          <div className="bookings-grid">
            {bookings.map(booking => {
              const role = window._novaUserRole;
              const userId = window._novaUserId;
              // Only show cards to admin/staff, or to guests if it's their own booking
              if (!(role === 'admin' || role === 'staff') && booking.user && booking.user._id !== userId) {
                return null;
              }
              return (
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
                    <p>Name: {booking.user.name}</p>
                    <p>Email: {booking.user.email}</p>
                    <p>Guests: {booking.num_guests}</p>
                    <p>Total Price: ${booking.room.price * 
                      Math.ceil((new Date(booking.check_out_date) - new Date(booking.check_in_date)) / (1000 * 3600 * 24))}</p>
                  </div>
                  {(window._novaUserRole === 'admin' || window._novaUserRole === 'staff') && (
                    <div className="booking-actions">
                      {booking.status === 'pending' && (
                        <button className="confirm-button"
                          onClick={() => confirmBooking(booking._id)}
                          disabled={confirmingId === booking._id}>
                          {confirmingId === booking._id ? 'Confirming...' : 'Confirm Booking'}
                        </button>
                      )}
                      <button className="cancel-button"
                        onClick={() => cancelBooking(booking._id)}
                        disabled={cancellingId === booking._id}>
                        {cancellingId === booking._id ? 'Cancelling...' : 'Cancel Booking'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}        
      <h1 className="dashboard-title" style={{ marginTop: '3rem' }}>Payments</h1>
      {payments.length === 0 ? (
          <div className="no-bookings">
            <p>No payments found</p>
          </div>
        ) : ( 
          <div className="bookings-grid">
            {payments.map(payment => {
              const role = window._novaUserRole;
              const userId = window._novaUserId;
              // Only show cards to admin/staff, or to guests if it's their own payment
              if (!(role === 'admin' || role === 'staff') && payment.user && payment.user._id !== userId) {
                return null;
              }
              return (
                <div key={payment._id} className="booking-card">
                  <div className="booking-header">
                    <h3>Payment #{payment._id.slice(-4)}</h3>
                    <span className={`status-badge ${payment.status}`}>
                      {payment.status}
                    </span>
                  </div>
                  <div className="booking-details">
                    <p>Name: {payment.user.name}</p>
                    <p>Email: {payment.user.email}</p>
                    <p>Amount: ${payment.amount}</p>
                    <p>Method: {payment.method}</p>
                    <p>Date: {new Date(payment.createdAt).toLocaleDateString()}</p>
                  </div>
                  {(window._novaUserRole === 'admin' || window._novaUserRole === 'staff') && (
                    <div className="booking-actions">
                      <button className="solved-button" onClick={() => completePayment(payment._id)}>
                        Mark as Completed
                      </button>
                      <button className="solved-button" onClick={() => refundPayment(payment._id)}>
                        Mark as Refunded
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <h1 className="dashboard-title" style={{ marginTop: '3rem' }}>Complaints</h1>
        {complaints.length === 0 ? (
          <div className="no-bookings">
            <p>You haven't submitted any complaints</p>
          </div>
        ) : (
          <div className="bookings-grid">
            {complaints.map(complaint => {
              const role = window._novaUserRole;
              const userId = window._novaUserId;
              // Only show cards to admin/staff, or to guests if it's their own complaint
              if (!(role === 'admin' || role === 'staff') && complaint.user && complaint.user._id !== userId) {
                return null;
              }
              return (
                <div key={complaint._id} className="booking-card">
                  <div className="booking-header">
                    <h3>{complaint.title}</h3>
                    <span className={`status-badge ${complaint.status}`}>
                      {complaint.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="user-info">
                    <p>Submitted by: {complaint.user.name}</p>
                    <p>Email: {complaint.user.email}</p>
                  </div>
                  <div className="booking-details">
                    <p className="complaint-description">{complaint.message}</p>
                    {complaint.resolution && (
                      <div className="resolution-notice">
                        <strong>Resolution:</strong>
                        <p>{complaint.resolution}</p>
                      </div>
                    )}
                  </div>
                  {(window._novaUserRole === 'admin' || window._novaUserRole === 'staff') && (
                    <div className="booking-actions">
                      <button className="solved-button" onClick={() => solveComplaint(complaint._id)}>
                        {complaint.status === 'open' ? 'Solving...' : 'Mark as Solved'}
                      </button>
                      <button className="solved-button" onClick={() => inProgressComplaint(complaint._id)}>
                        {cancellingId === complaint._id ? 'in-progress...' : 'Mark as In Progress'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>


      </div>
      
  );
};

export default Dashboard;