import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { WindowManager } from './components/Windows';
import { ProtectedRoute, UserMenu } from './components/Auth';
import Desktop from './components/Desktop/Desktop';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <ProtectedRoute>
          <WindowManager>
            <Desktop />
            <UserMenu />
          </WindowManager>
        </ProtectedRoute>
      </div>
    </AuthProvider>
  );
}

export default App;
