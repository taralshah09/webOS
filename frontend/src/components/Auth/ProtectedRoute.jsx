import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import LoginForm from './LoginForm';

const ProtectedRoute = ({ children, fallback = null }) => {
  const { user, loading, login } = useAuth();

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
    return <LoginForm onLogin={login} />;
  }

  // Show fallback if provided and not authenticated
  if (fallback && !user) {
    return fallback;
  }

  // Show protected content if authenticated
  return children;
};

export default ProtectedRoute; 