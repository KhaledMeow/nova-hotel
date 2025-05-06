import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import '../styles/ResetPassword.css';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Extract token from query string: ?token=...
  const params = new URLSearchParams(location.search);
  const token = params.get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!password || !confirm) {
      setError('Please fill in all fields.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (!token) {
      setError('Invalid or missing reset token.');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('/api/v1/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage(data.message || 'Password reset successfully! Redirecting to login...');
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setError(data.error || 'Failed to reset password.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again later.');
    }
    setLoading(false);
  };

  return (
    <div className="reset-password-container">
      <div className="reset-password-form">
        <h2 className="reset-password-title">Reset Password</h2>
        <form onSubmit={handleSubmit}>
          <div className="reset-password-form-group">
            <label htmlFor="password" className="reset-password-label">New Password:</label>
            <input
              type="password"
              id="password"
              className="reset-password-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="reset-password-form-group">
            <label htmlFor="confirm" className="reset-password-label">Confirm New Password:</label>
            <input
              type="password"
              id="confirm"
              className="reset-password-input"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="reset-password-submit-button" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
          {message && <div className="reset-password-success">{message}</div>}
          {error && <div className="reset-password-error">{error}</div>}
        </form>
        <div className="reset-password-footer">
          <Link to="/login">Back to Login</Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;