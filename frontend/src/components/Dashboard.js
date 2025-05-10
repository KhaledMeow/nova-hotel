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
const [users, setUsers] = useState([]);

  const filteredComplaints = (roleName === 'admin' || roleName === 'staff') && categoryFilter
    ? complaints.filter(c => c.category === categoryFilter)
    : complaints;


  // Move fetchData outside useEffect so it can be called by other functions
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
        let usersRes = null;
        const isAdminOrStaff = decoded.roleName === 'admin' || decoded.roleName === 'staff';
        if (isAdminOrStaff) {
          usersRes = await fetch('/api/v1/users', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
        }
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
        if (isAdminOrStaff && usersRes && !usersRes.ok) {
          throw new Error('Failed to fetch users');
        }

        const bookingsData = await bookingsRes.json();
        const complaintsData = await complaintsRes.json();
        const paymentsData = await paymentsRes.json();
        let usersData = [];
        if (isAdminOrStaff && usersRes) {
          usersData = await usersRes.json();
        }
        setBookings(bookingsData);
        setComplaints(complaintsData);
        setPayments(paymentsData);
        if (isAdminOrStaff) setUsers(usersData);
        
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
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

  // Modal state and handlers
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({ name: '', email: '', password: '', phone: '', role: '67b796f382f9002a043ad2ac' });
  const [userActionLoading, setUserActionLoading] = useState(false);

  const openAddUserModal = () => {
    setEditingUser(null);
    setUserForm({ name: '', email: '', password: '', phone: '', role: '67b796f382f9002a043ad2ac' });
    setShowUserModal(true);
  };
  const openEditUserModal = (user) => {
    setEditingUser(user);
    setUserForm({
      name: user.name || '',
      email: user.email || '',
      password: '', // Don't show password
      phone: user.phone || '',
      role: user.role || '67b796f382f9002a043ad2ac'
    });
    setShowUserModal(true);
  };
  const closeUserModal = () => {
    setShowUserModal(false);
    setEditingUser(null);
  };
  const handleUserFormChange = (e) => {
    setUserForm({ ...userForm, [e.target.name]: e.target.value });
  };
  const handleUserFormSubmit = async (e) => {
    e.preventDefault();
    setUserActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      let response;
      if (editingUser) {
        // Edit user
        response = await fetch(`/api/v1/users/${editingUser._id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            name: userForm.name,
            email: userForm.email,
            phone: userForm.phone,
            role: userForm.role
          })
        });
      } else {
        // Add user
        response = await fetch('/api/v1/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(userForm)
        });
      }
      if (!response.ok) {
        const err = await response.json();
        if (
          err.error &&
          err.error.includes('duplicate key error') &&
          err.error.includes('email')
        ) {
          throw new Error('A user with this email already exists.');
        }
        throw new Error(err.error || 'Failed to save user');
      }
      closeUserModal();
      // Refetch users
      fetchData();
    } catch (error) {
      alert(error.message);
    } finally {
      setUserActionLoading(false);
    }
  };
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    if (!window.confirm('After this action, the user will be permanently deleted.')) return;
    setUserActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to delete user');
      }
      // Refetch users
      fetchData();
    } catch (error) {
      alert(error.message);
    } finally {
      setUserActionLoading(false);
    }
  };

  // Users Dashboard visibility control
  const [showUsersSection, setShowUsersSection] = useState(false);

  // Users Cards for Admin/Staff
  const usersCards = (roleName === 'admin' || roleName === 'staff') && showUsersSection ? (
    <div className="users-section">
      <button className="add-user-button" style={{marginBottom: '1.5rem'}} onClick={openAddUserModal}>Add User</button>
      <div className="users-grid">
        {users.map(user => {
          let roleDisplay = user.roleName || user.role || 'user';
          if (user.role === '67b796f382f9002a043ad2aa') roleDisplay = 'Admin';
          if (user.role === '67b796f382f9002a043ad2ab') roleDisplay = 'Staff';
          if (user.role === '67b796f382f9002a043ad2ac') roleDisplay = 'Guest';
          return (
            <div key={user._id} className="user-card">
              <div className="user-header">
                <h3>{user.name}</h3>
                <span className={`user-role ${roleDisplay.toLowerCase()}`}>{roleDisplay}</span>
              </div>
              <div className="user-details">
                <p>Email: {user.email}</p>
                <p>Phone: {user.phone || 'N/A'}</p>
              </div>
              <div className="user-registered">
                Registered: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </div>
              <div className="user-actions" style={{marginTop: '1rem', display: 'flex', gap: '0.5rem'}}>
                <button className="edit-user-button" onClick={() => openEditUserModal(user)}>Edit</button>
                <button className="delete-user-button" onClick={() => handleDeleteUser(user._id)}>Delete</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  ) : null;

  if (loading) return <div className="loading-spinner"></div>;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <div className="room-list-page">
      <div className="dashboard-container">
        {/* User Add/Edit Modal */}
        {showUserModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>{editingUser ? 'Edit User' : 'Add User'}</h2>
              <form onSubmit={handleUserFormSubmit} className="user-form">
                <label>Name
                  <input name="name" type="text" value={userForm.name} onChange={handleUserFormChange} required />
                </label>
                <label>Email
                  <input name="email" type="email" value={userForm.email} onChange={handleUserFormChange} required />
                </label>
                <label>Phone
                  <input name="phone" type="tel" value={userForm.phone} onChange={handleUserFormChange} placeholder="e.g. +123456789" />
                </label>
                {!editingUser && (
                  <label>Password
                    <input name="password" type="password" value={userForm.password} onChange={handleUserFormChange} required />
                  </label>
                )}
                <label>Role
                  <select name="role" value={userForm.role} onChange={handleUserFormChange} required>
                    <option value="67b796f382f9002a043ad2aa">Admin</option>
                    <option value="67b796f382f9002a043ad2ab">Staff</option>
                    <option value="67b796f382f9002a043ad2ac">Guest</option>
                  </select>
                </label>
                <div style={{display:'flex',gap:'1rem',marginTop:'1.5rem'}}>
                  <button type="submit" className="edit-user-button" disabled={userActionLoading}>
                    {userActionLoading ? 'Saving...' : (editingUser ? 'Save Changes' : 'Add User')}
                  </button>
                  <button type="button" className="delete-user-button" onClick={closeUserModal} disabled={userActionLoading}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
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
                    <h3>{booking.room && booking.room.name ? booking.room.name : 'Unknown Room'}</h3>
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
                    <p>Name: {booking.user && booking.user.name ? booking.user.name : 'Unknown User'}</p>
                    <p>Email: {booking.user && booking.user.email ? booking.user.email : 'N/A'}</p>
                    <p>Guests: {booking.num_of_people}</p>
                    <p>Total Price: ${booking.room && booking.room.price ? booking.room.price * Math.ceil((new Date(booking.check_out_date) - new Date(booking.check_in_date)) / (1000 * 3600 * 24)) : 'N/A'}</p>
                  </div>
                  <div className="booking-actions" style={{marginTop: '1rem', display: 'flex', gap: '0.5rem'}}>
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
        <p>Name: {payment.user ? payment.user.name : 'Unknown User'}</p>
        <p>Email: {payment.user ? payment.user.email : 'N/A'}</p>
        <p>Amount: ${payment.amount}</p>
        <p>Date: {new Date(payment.createdAt).toLocaleDateString()}</p>
      </div>
      <div className="booking-actions" style={{marginTop: '1rem', display: 'flex', gap: '0.5rem'}}>
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
        <p>Submitted by: {complaint.user ? complaint.user.name : 'Unknown User'}</p>
        <p>Email: {complaint.user ? complaint.user.email : 'N/A'}</p>
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
      <div className="booking-actions" style={{marginTop: '1rem', display: 'flex', gap: '0.5rem'}}>
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
      {/* Toggle Users Dashboard button for Admin/Staff */}
      <h1>Users</h1>
      {(roleName === 'admin' || roleName === 'staff') && (
        <button
          className="add-user-button"
          style={{marginBottom: '1.5rem',alignItems: 'center'}}
          onClick={() => setShowUsersSection(v => !v)}
        >
          <span>{showUsersSection ? 'Hide Users Dashboard' : 'Show Users Dashboard'}</span>
        </button>
      )}
      {usersCards}
      </div>
    </div>
  );
};

export default Dashboard;