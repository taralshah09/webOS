import React, { createContext, useContext, useState, useEffect } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  // Check for existing user session on app load
  useEffect(() => {
    const checkAuth = () => {
      try {
        const storedUser = localStorage.getItem('webos_user');
        const storedToken = localStorage.getItem('webos_token');
        
        if (storedUser && storedToken) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setToken(storedToken);
        }
      } catch (error) {
        console.error('Error loading auth data:', error);
        // Clear corrupted data
        localStorage.removeItem('webos_user');
        localStorage.removeItem('webos_token');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const { username, password } = credentials;
      const res = await authService.login(username, password);
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem('webos_user', JSON.stringify(res.user));
      localStorage.setItem('webos_token', res.token);
      return { success: true, message: res.message };
    } catch (err) {
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      if (token) {
        await authService.logout(token);
      }
    } catch (err) {
      // Optionally handle logout error
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('webos_user');
      localStorage.removeItem('webos_token');
      setLoading(false);
    }
  };

  const register = async ({ username, email, password }) => {
    setLoading(true);
    try {
      const res = await authService.register(username, email, password);
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem('webos_user', JSON.stringify(res.user));
      localStorage.setItem('webos_token', res.token);
      return { success: true, message: res.message };
    } catch (err) {
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  const updateUser = (updates) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('webos_user', JSON.stringify(updatedUser));
  };

  const isAuthenticated = () => {
    return !!user && !!token;
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    register,
    updateUser,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 