import React, { useState } from 'react';
import './LoginForm.css';

const LoginForm = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simple validation
      if (!credentials.username.trim() || !credentials.password.trim()) {
        throw new Error('Please enter both username and password');
      }

      // For demo purposes, accept any non-empty credentials
      // In a real app, you'd validate against a backend
      if (credentials.username.trim() && credentials.password.trim()) {
        const user = {
          id: Date.now(),
          username: credentials.username.trim(),
          email: `${credentials.username}@webos.local`,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${credentials.username}`,
          role: 'user',
          loginTime: new Date().toISOString()
        };

        // Store user in localStorage
        localStorage.setItem('webos_user', JSON.stringify(user));
        localStorage.setItem('webos_token', `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
        
        onLogin(user);
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
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
          <p className="login-subtitle">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form-content">
          {error && (
            <div className="login-error">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={credentials.username}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              className="form-input"
              placeholder="Enter your username"
              autoComplete="username"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              className="form-input"
              placeholder="Enter your password"
              autoComplete="current-password"
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
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="login-footer">
          <p className="demo-note">
            💡 Demo: Use any username and password to sign in
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm; 