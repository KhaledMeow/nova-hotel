import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import jwtDecode from 'jwt-decode';
import "../styles/Dashboard.css";
import '../styles/SpecialOfferPopup.css';

const Dashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [confirmingId, setConfirmingId] = useState(null);
  const [inProgressId, setInProgressId] = useState(null);
  const [roleName, setRoleName] = useState('');
  const [payments, setPayments] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("");

  const filteredComplaints = (roleName === 'admin' || roleName === 'staff') && categoryFilter
    ? complaints.filter(c => c.category === categoryFilter)
    : complaints;


  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          window.location = '/login';
          return;
        }

        const decoded = jwtDecode(token);
        setRoleName(decoded.roleName);
        const currentUserId = decoded.userId || decoded._id || decoded.id; 
        window._novaUserId = currentUserId;
        
        const bookingsEndpoint = (decoded.roleName === 'admin' || decoded.roleName === 'staff') ? '/api/v1/bookings' : '/api/v1/bookings/my';
        const complaintsEndpoint = (decoded.roleName === 'admin' || decoded.roleName === 'staff') ? '/api/v1/complaints' : '/api/v1/complaints/my';
        const paymentsEndpoint = (decoded.roleName === 'admin' || decoded.roleName === 'staff') ? '/api/v1/payments' : '/api/v1/payments/my';
        const [bookingsRes, complaintsRes, paymentsRes] = await Promise.all([
          fetch(bookingsEndpoint, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(complaintsEndpoint, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(paymentsEndpoint, {
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

//bookings
  const confirmBooking = async (bookingId) => {
    if (!window.confirm('Confirm this booking?')) return;
    try {
      setConfirmingId(bookingId);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/bookings/${bookingId}/confirm`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to confirm booking');
      }
      
      const updatedBooking = await response.json();
      setBookings(prev => prev.map(b => 
        b._id === bookingId ? updatedBooking : b
      ));
      window.dispatchEvent(new Event('roomsUpdated'));
      window.location.reload();
    } catch (error) {
      alert(error.message);
    } finally {
      setConfirmingId(null);
    }
  };

  const cancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;    try { 
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

  const deleteBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to delete this booking?')) return;
    if (!window.confirm('After this action, the booking will be permanently deleted.')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete booking');
      }
      setBookings(prev => prev.filter(b => b._id !== bookingId));
    } catch (error) {
      alert(error.message);
      console.error('Delete Booking Error:', error);
    }
  };

//payments
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
  
      setPayments(prev => prev.map(p => 
        p._id === paymentId ? { ...p, status: 'refunded' } : p
      ));
    } catch (error) {
      alert(error.message);
      console.error('Refund Payment Error:', error);
    }
  };

  const deletePayment = async (paymentId) => {
    if (!window.confirm('Are you sure you want to delete this payment?')) return;
    if (!window.confirm('After this action, the payment will be permanently deleted.')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/payments/${paymentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete payment');
      }
      setPayments(prev => prev.filter(p => p._id !== paymentId));
    } catch (error) {
      alert(error.message);
      console.error('Delete Payment Error:', error);
    }
  };

//complaints
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
      setInProgressId(complaintId);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/complaints/${complaintId}/in-progress`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to mark complaint as in progress');
      }
  

      setComplaints(prev => prev.map(c => 
        c._id === complaintId ? { ...c, status: 'in_progress' } : c
      ));
    } catch (error) {
      alert(error.message);
      console.error('In Progress Complaint Error:', error);
    } finally {
      setInProgressId(null);
    }
  };

  const deleteComplaint = async (complaintId) => {
    if (!window.confirm('Are you sure you want to delete this complaint?')) return;
    if (!window.confirm('After this action, the complaint will be permanently deleted.')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/complaints/${complaintId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete complaint');
      }
      setComplaints(prev => prev.filter(c => c._id !== complaintId));
    } catch (error) {
      alert(error.message);
      console.error('Delete Complaint Error:', error);
    }
  };

  useEffect(() => {
    console.log('Bookings:', bookings);
    console.log('Current user role:', roleName);
  }, [bookings, roleName]);


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
    const userId = window._novaUserId;
    if (roleName === 'guest' && booking.user && booking.user._id !== userId) {
      return null;
    }
    return (
      <div key={booking._id} className="booking-card">
        <div className="booking-header">
          <h3>{booking.room.name}</h3>
          <span className={`status-badge ${booking.status}`}>{booking.status}</span>
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
        <p>Guests: {booking.num_of_people}</p>
        <p>Total Price: ${booking.room.price * Math.ceil((new Date(booking.check_out_date) - new Date(booking.check_in_date)) / (1000 * 3600 * 24))}</p>
      </div>
      <div className="booking-actions">
      {(roleName === 'admin' || roleName === 'staff') && (
        <>
          <button
            className="confirm-button"
            onClick={() => confirmBooking(booking._id)}
            disabled={(booking.status === 'confirmed') || confirmingId === booking._id}
          >
            {booking.status === 'confirmed'
              ? 'Confirmed'
              : confirmingId === booking._id
                ? 'Confirming...'
                : 'Confirm'}
          </button>
          <button
            className="cancel-button"
            onClick={() => cancelBooking(booking._id)}
            disabled={booking.status === 'cancelled' || cancellingId === booking._id}
          >
            {booking.status === 'cancelled'
              ? 'Cancelled'
              : cancellingId === booking._id
                ? 'Cancelling...'
                : 'Cancel'}
          </button>
          <button
            className="delete-button"
            style={{marginLeft: 'auto'}}
            onClick={() => deleteBooking(booking._id)}
          >
            Delete
          </button>
        </>
      )}
    </div>
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
  const userId = window._novaUserId;
  if (roleName === 'guest' && payment.user && payment.user._id !== userId) {
    return null;
  }
  return (
    <div key={payment._id} className="booking-card">
      <div className="booking-header">
        <h3>Payment #{payment._id.slice(-4)}</h3>
        <span className={`status-badge ${payment.status}`}>{payment.status}</span>
      </div>
      <div className="booking-details">
        <p>Name: {payment.user.name}</p>
        <p>Email: {payment.user.email}</p>
        <p>Amount: ${payment.amount}</p>
        <p>Date: {new Date(payment.createdAt).toLocaleDateString()}</p>
      </div>
      <div className="booking-actions">
        {(roleName === 'admin' || roleName === 'staff') && (
          <>
            <button
              className="solved-button"
              disabled={payment.status === 'completed'}
              onClick={() => completePayment(payment._id)}
            >
              {payment.status === 'completed' ? 'Completed' : 'Complete'}
            </button>
            <button
              className="solved-button"
              disabled={payment.status === 'refunded'}
              onClick={() => refundPayment(payment._id)}
            >
              {payment.status === 'refunded' ? 'Refunded' : 'Refund'}
            </button>
            <button
              className="delete-button"
              style={{marginLeft: 'auto'}}
              onClick={() => deletePayment(payment._id)}
            >
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
})}
          </div>
        )}

        <h1 className="dashboard-title" style={{ marginTop: '3rem' }}>Complaints</h1>
        {(roleName === 'admin' || roleName === 'staff') && (
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="categoryFilter" style={{ marginRight: '0.5rem' }}>Filter by Category:</label>
            <select
              id="categoryFilter"
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              style={{ padding: '0.3rem 1rem', borderRadius: '6px' }}
            >
              <option value="">All</option>
              <option value="service">Service</option>
              <option value="facility">Facility</option>
              <option value="billing">Billing</option>
              <option value="other">Other</option>
            </select>
          </div>
        )}
        {filteredComplaints.length === 0 ? (
          <div className="no-bookings">
            <p>No complaints found for this category.</p>
          </div>
        ) : (
          <div className="bookings-grid">
            {filteredComplaints.map(complaint => {
  const userId = window._novaUserId;
  if (roleName === 'guest' && complaint.user && complaint.user._id !== userId) {
    return null;
  }
  return (
    <div key={complaint._id} className="booking-card">
      <div className="booking-header">
        <h3>{complaint.title}</h3>
        <span className={`status-badge ${complaint.status}`}>{complaint.status.replace('_', ' ')}</span>
      </div>
      <div className="user-info">
        <p>Submitted by: {complaint.user.name}</p>
        <p>Email: {complaint.user.email}</p>
        <p>Category: {complaint.category}</p>
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
      <div className="booking-actions">
        {(roleName === 'admin' || roleName === 'staff') && (
          <>
            <button
              className="solved-button"
              disabled={complaint.status === 'solved'}
              onClick={() => solveComplaint(complaint._id)}
            >
              {complaint.status === 'solved' ? 'Solved' : 'Solve'}
            </button>
            <button
              className="solved-button"
              disabled={complaint.status === 'in_progress' || inProgressId === complaint._id}
              onClick={() => inProgressComplaint(complaint._id)}
            >
              {complaint.status === 'in_progress'
                ? 'In Progress'
                : inProgressId === complaint._id
                  ? 'Processing...'
                  : 'In Progress'}
            </button>
            <button
              className="delete-button"
              style={{marginLeft: 'auto'}}
              onClick={() => deleteComplaint(complaint._id)}
            >
              Delete
            </button>
          </>
        )}
      </div>
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