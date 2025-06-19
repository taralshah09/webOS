import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { WindowManager } from './components/Windows';
import { ProtectedRoute, UserMenu, LoginForm, RegisterForm } from './components/Auth';
import Desktop from './components/Desktop/Desktop';
import './App.css';

function ProtectedApp() {
  return (
    <ProtectedRoute>
      <WindowManager>
        <Desktop />
        <UserMenu />
      </WindowManager>
    </ProtectedRoute>
  );
}

function LoginPage() {
  const { user, login } = useAuth();
  if (user) return <Navigate to="/" replace />;
  return <LoginForm onLogin={login} />;
}

function RegisterPage() {
  const { user, register } = useAuth();
  if (user) return <Navigate to="/" replace />;
  return <RegisterForm onRegister={register} />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/*" element={<ProtectedApp />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
