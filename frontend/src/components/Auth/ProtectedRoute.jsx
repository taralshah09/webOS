import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import './ProtectedRoute.css';

const ProtectedRoute = ({ children, fallback = null }) => {
  const { user, loading, login, register } = useAuth();
  const [showRegister, setShowRegister] = useState(false);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="auth-loading">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!user) {
    return (
      <div className="protected-overlay">
        <div className="protected-form-wrapper">
          {showRegister ? (
            <RegisterForm onRegister={register} />
          ) : (
            <LoginForm onLogin={login} />
          )}
          
        </div>
      </div>
    );
  }

  // Show fallback if provided and not authenticated
  if (fallback && !user) {
    return fallback;
  }

  // Show protected content if authenticated
  return children;
};

export default ProtectedRoute; 