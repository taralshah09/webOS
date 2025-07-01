import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './ClassicLoginForm.css';

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
    <div className="auth-container">
      <div className="auth-background"></div>
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <div className="logo-emblem">
              <span className="logo-symbol">⚡</span>
            </div>
            <h1 className="brand-title">Web OS</h1>
          </div>
          <div className="auth-divider"></div>
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">Join us and start your journey</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="alert alert-error">
              <div className="alert-icon">⚠</div>
              <div className="alert-content">{error}</div>
            </div>
          )}
          
          {success && (
            <div className="alert alert-success">
              <div className="alert-icon">✓</div>
              <div className="alert-content">{success}</div>
            </div>
          )}

          <div className="form-field">
            <label htmlFor="username" className="field-label">Username</label>
            <div className="input-wrapper">
              <input
                type="text"
                id="username"
                name="username"
                value={form.username}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Choose a username"
                autoComplete="username"
                disabled={isLoading}
              />
              <div className="input-underline"></div>
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="email" className="field-label">Email Address</label>
            <div className="input-wrapper">
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
              <div className="input-underline"></div>
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="password" className="field-label">Password</label>
            <div className="input-wrapper">
              <input
                type="password"
                id="password"
                name="password"
                value={form.password}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Create a secure password"
                autoComplete="new-password"
                disabled={isLoading}
              />
              <div className="input-underline"></div>
            </div>
          </div>

          <button
            type="submit"
            className={`auth-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="button-spinner"></span>
                Creating Account...
              </>
            ) : (
              <>
                <span>Create Account</span>
                <span className="button-arrow">→</span>
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <div className="footer-divider"></div>
          <p className="auth-switch">
            Already have an account?{' '}
            <Link to="/login" className="auth-link">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;