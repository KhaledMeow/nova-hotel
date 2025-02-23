import { Link } from 'react-router-dom';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';

const Login = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    if (!credentials.email) newErrors.email = 'Email is required';
    if (!credentials.password) newErrors.password = 'Password is required';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    try {
      const response = await fetch('http://localhost:5432/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data?.error || 'Login failed';
        setErrors({ general: errorMessage });
        return;
      }

      localStorage.setItem('token', data.token);
      navigate('/');
      
    } catch (error) {
      setErrors({ general: 'Network error. Please try again.' });
      console.error('Login Error:', error);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2 className="login-title">Login</h2>
        
        {errors.general && (
          <div className="login-error-general">{errors.general}</div>
        )}

        <div className="login-form-group">
          <label className="login-label">Email</label>
          <input
            type="email"
            value={credentials.email}
            onChange={(e) => setCredentials({...credentials, email: e.target.value})}
            className={`login-input ${errors.email ? 'input-error' : ''}`}
          />
          {errors.email && <span className="login-error">{errors.email}</span>}
        </div>

        <div className="login-form-group">
          <label className="login-label">Password</label>
          <input
            type="password"
            value={credentials.password}
            onChange={(e) => setCredentials({...credentials, password: e.target.value})}
            className={`login-input ${errors.password ? 'input-error' : ''}`}
          />
          {errors.password && <span className="login-error">{errors.password}</span>}
        </div>

        <button type="submit" className="login-submit-button">
          Sign In
        </button>

        <div className="login-footer">
          <span>Don't have an account? </span>
          <Link to="/register" className="login-register-link">
            Register here
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Login;