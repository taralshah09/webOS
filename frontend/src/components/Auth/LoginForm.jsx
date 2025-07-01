import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './ClassicLoginForm.css';

const LoginForm = ({ onLogin }) => {
  const [form, setForm] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      if (!form.username.trim() || !form.password.trim()) {
        throw new Error('Please fill in all fields');
      }
      const result = await onLogin(form);
      if (!result.success) {
        setError(result.message || 'Login failed');
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
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">Sign in to continue your session</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="alert alert-error">
              <div className="alert-icon">⚠</div>
              <div className="alert-content">{error}</div>
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
                placeholder="Enter your username"
                autoComplete="username"
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
                placeholder="Enter your password"
                autoComplete="current-password"
                disabled={isLoading}
              />
              <div className="input-underline"></div>
            </div>
          </div>

          <div className="form-options">
            <label className="checkbox-wrapper">
              <input type="checkbox" className="checkbox-input" />
              <span className="checkbox-custom"></span>
              <span className="checkbox-label">Remember me</span>
            </label>
            <a href="#" className="forgot-link">Forgot password?</a>
          </div>

          <button
            type="submit"
            className={`auth-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="button-spinner"></span>
                Signing In...
              </>
            ) : (
              <>
                <span>Sign In</span>
                <span className="button-arrow">→</span>
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <div className="footer-divider"></div>
          <p className="auth-switch">
            Don't have an account?{' '}
            <Link to="/register" className="auth-link">Create Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;