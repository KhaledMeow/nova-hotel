import { Link } from 'react-router-dom';
import React, { useState } from 'react';
import '../styles/ForgotPassword.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
        // Show reset link in UI for development/testing
        if (data.token) {
          setMessage(
            (data.message || 'Password reset instructions sent to your email.') +
            `\n\nReset Link (dev only): ${window.location.origin}/reset-password?token=${data.token}`
          );
        }
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
          {message && (
            <div className="forgot-password-success" style={{ whiteSpace: 'pre-line', wordBreak: 'break-all' }}>
              {message}
              {/* If message contains a reset link, also render it as a clickable link for convenience */}
              {message.includes('/reset-password?token=') && (
                <>
                  <br />
                  <a
                    href={message.match(/(https?:\/\/[^\s]+)/)?.[0]}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#fca53a', fontWeight: 'bold', display: 'block', marginTop: '1rem' }}
                  >
                    Open Reset Link
                  </a>
                </>
              )}
            </div>
          )}
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