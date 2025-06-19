import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './LoginForm.css';

const RegisterForm = ({ onRegister }) => {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      if (!form.username.trim() || !form.email.trim() || !form.password.trim()) {
        throw new Error('Please fill in all fields');
      }
      const result = await onRegister(form);
      if (!result.success) {
        setError(result.message || 'Registration failed');
      } else {
        setSuccess(result.message || 'Registration successful! You can now log in.');
        setForm({ username: '', email: '', password: '' });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <div className="login-header">
          <div className="login-logo">
            <span className="logo-icon">🖥️</span>
            <h1>Web OS</h1>
          </div>
          <p className="login-subtitle">Create a new account</p>
        </div>
        <form onSubmit={handleSubmit} className="login-form-content">
          {error && (
            <div className="login-error">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}
          {success && (
            <div className="login-success">
              <span className="success-icon">✅</span>
              {success}
            </div>
          )}
          <div className="form-group">
            <label htmlFor="username" className="form-label">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={form.username}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter your username"
              autoComplete="username"
              disabled={isLoading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={form.email}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter your email"
              autoComplete="email"
              disabled={isLoading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={form.password}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter your password"
              autoComplete="new-password"
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            className={`login-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="loading-spinner"></span>
                Creating account...
              </>
            ) : (
              'Register'
            )}
          </button>
        </form>
        <div className="protected-toggle-link">
          <span>
            Already have an account?{' '}
            <Link to="/login">Sign in</Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm; 