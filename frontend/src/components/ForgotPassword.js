import { Link } from 'react-router-dom';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ForgotPassword.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const response = await fetch('/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage(data.message || 'Password reset instructions sent to your email.');
        setTimeout(() => navigate('/login'), 3000); // Optional: Redirect after 3s
      } else {
        setError(data.error || 'Failed to send reset instructions.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again later.');
    }
    setLoading(false);
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-form">
        <h2 className="forgot-password-title">Forgot Password</h2>
        <form onSubmit={handleSubmit}>
          <div className="forgot-password-form-group">
            <label htmlFor="email" className="forgot-password-label">Enter your email address:</label>
            <input
              type="email"
              id="email"
              className="forgot-password-input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="forgot-password-submit-button" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
          {message && <div className="forgot-password-success">{message}</div>}
          {error && <div className="forgot-password-error">{error}</div>}
        </form>
        <div className="forgot-password-footer">
          <Link to="/login">Back to Login</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;