import React, { useState, useEffect, useRef } from 'react';
import './Taskbar.css';
import { useAuth } from '../../contexts/AuthContext';

const Taskbar = ({ 
  windows = [], 
  onWindowFocus, 
  onWindowMinimize, 
  createWindow,
  onStartMenuAction 
}) => {
  const { user, logout } = useAuth();
  const [showStartMenu, setShowStartMenu] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showUserMenu, setShowUserMenu] = useState(false);
  const startMenuRef = useRef(null);
  const userMenuRef = useRef(null);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (startMenuRef.current && !startMenuRef.current.contains(event.target)) {
        setShowStartMenu(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleStartClick = () => {
    setShowStartMenu(!showStartMenu);
    setShowUserMenu(false);
  };

  const handleUserClick = () => {
    setShowUserMenu(!showUserMenu);
    setShowStartMenu(false);
  };

  const handleWindowClick = (windowId) => {
    const window = windows.find(w => w.id === windowId);
    if (window) {
      if (window.isMinimized) {
        // Restore minimized window
        onWindowFocus(windowId);
      } else if (window.isFocused) {
        // Minimize if already focused
        onWindowMinimize(windowId);
      } else {
        // Focus the window
        onWindowFocus(windowId);
      }
    }
  };

  const handleAppLaunch = (appType) => {
    const appConfigs = {
      notepad: {
        title: 'Notepad',
        content: 'notepad',
        initialSize: { width: 600, height: 400 },
        minSize: { width: 300, height: 200 }
      },
      fileexplorer: {
        title: 'File Explorer',
        content: 'fileexplorer',
        initialSize: { width: 800, height: 600 },
        minSize: { width: 600, height: 400 }
      },
      browser: {
        title: 'Web Browser',
        content: 'browser',
        initialSize: { width: 900, height: 600 },
        minSize: { width: 400, height: 300 }
      },
      terminal: {
        title: 'Terminal',
        content: 'terminal',
        initialSize: { width: 700, height: 400 },
        minSize: { width: 400, height: 250 }
      },
      calculator: {
        title: 'Calculator',
        content: 'calculator',
        initialSize: { width: 300, height: 400 },
        minSize: { width: 250, height: 350 }
      },
      settings: {
        title: 'Settings',
        content: 'settings',
        initialSize: { width: 600, height: 500 },
        minSize: { width: 400, height: 300 }
      }
    };

    const config = appConfigs[appType];
    if (config && createWindow) {
      createWindow({
        ...config,
        initialPosition: { 
          x: 100 + Math.random() * 200, 
          y: 100 + Math.random() * 150 
        }
      });
    }

    setShowStartMenu(false);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getWindowIcon = (window) => {
    const iconMap = {
      'Notepad': '📝',
      'File Explorer': '📂',
      'Web Browser': '🌐',
      'Terminal': '🖳',
      'Calculator': '🔢',
      'Settings': '⚙️',
      'My Computer': '🖥️'
    };
    
    const baseTitle = window.title.split(' - ')[0];
    return iconMap[baseTitle] || '📄';
  };

  const quickActions = [
    { id: 'notepad', name: 'Notepad', icon: '📝' },
    { id: 'fileexplorer', name: 'File Explorer', icon: '📂' },
    { id: 'browser', name: 'Browser', icon: '🌐' },
    { id: 'terminal', name: 'Terminal', icon: '🖳' },
    { id: 'calculator', name: 'Calculator', icon: '🔢' },
    { id: 'settings', name: 'Settings', icon: '⚙️' }
  ];

  return (
    <div className="taskbar">
      {/* Start Button */}
      <div className="taskbar-section taskbar-start">
        <button 
          className={`start-button ${showStartMenu ? 'active' : ''}`}
          onClick={handleStartClick}
          title="Start"
        >
          <span className="start-icon">⊞</span>
        </button>
        
        {/* Start Menu */}
        {showStartMenu && (
          <div className="start-menu" ref={startMenuRef}>
            <div className="start-menu-header">
              <div className="user-info">
                <div className="user-avatar">
                  {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="username">{user?.username || 'User'}</span>
              </div>
            </div>
            
            <div className="start-menu-content">
              <div className="start-menu-section">
                <h4>Pinned Apps</h4>
                <div className="app-grid">
                  {quickActions.map(app => (
                    <button
                      key={app.id}
                      className="app-tile"
                      onClick={() => handleAppLaunch(app.id)}
                      title={app.name}
                    >
                      <span className="app-icon">{app.icon}</span>
                      <span className="app-name">{app.name}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="start-menu-section">
                <h4>Quick Actions</h4>
                <div className="quick-actions">
                  <button 
                    className="quick-action-btn"
                    onClick={() => {
                      setShowStartMenu(false);
                      onStartMenuAction?.('lock');
                    }}
                  >
                    🔒 Lock
                  </button>
                  <button 
                    className="quick-action-btn"
                    onClick={() => {
                      setShowStartMenu(false);
                      onStartMenuAction?.('restart');
                    }}
                  >
                    🔄 Restart
                  </button>
                  <button 
                    className="quick-action-btn"
                    onClick={() => {
                      setShowStartMenu(false);
                      onStartMenuAction?.('shutdown');
                    }}
                  >
                    ⏻ Shutdown
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Running Applications */}
      <div className="taskbar-section taskbar-apps">
        {windows.map(window => (
          <button
            key={window.id}
            className={`taskbar-app ${window.isFocused ? 'active' : ''} ${window.isMinimized ? 'minimized' : ''}`}
            onClick={() => handleWindowClick(window.id)}
            title={window.title}
          >
            <span className="app-icon">{getWindowIcon(window)}</span>
            <span className="app-title">{window.title}</span>
            {!window.isMinimized && <div className="active-indicator"></div>}
          </button>
        ))}
      </div>

      {/* System Tray */}
      <div className="taskbar-section taskbar-system">
        {/* System Icons */}
        <div className="system-icons">
          <button className="system-icon" title="Network">
            📶
          </button>
          <button className="system-icon" title="Sound">
            🔊
          </button>
          <button className="system-icon" title="Battery">
            🔋
          </button>
        </div>

        {/* Clock */}
        <div className="taskbar-clock" title={formatDate(currentTime)}>
          <div className="time">{formatTime(currentTime)}</div>
          <div className="date">{formatDate(currentTime)}</div>
        </div>

        {/* User Menu */}
        <div className="user-section">
          <button 
            className={`user-button ${showUserMenu ? 'active' : ''}`}
            onClick={handleUserClick}
            title="User Options"
          >
            <div className="user-avatar-small">
              {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
            </div>
          </button>
          
          {showUserMenu && (
            <div className="user-menu" ref={userMenuRef}>
              <div className="user-menu-header">
                <div className="user-avatar">
                  {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="user-details">
                  <div className="username">{user?.username || 'User'}</div>
                  <div className="user-email">{user?.email || 'user@webos.com'}</div>
                </div>
              </div>
              
              <div className="user-menu-actions">
                <button 
                  className="user-menu-btn"
                  onClick={() => {
                    setShowUserMenu(false);
                    handleAppLaunch('settings');
                  }}
                >
                  ⚙️ Settings
                </button>
                <button 
                  className="user-menu-btn"
                  onClick={() => {
                    setShowUserMenu(false);
                    onStartMenuAction?.('lock');
                  }}
                >
                  🔒 Lock Screen
                </button>
                <hr className="user-menu-divider" />
                <button 
                  className="user-menu-btn logout-btn"
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                  }}
                >
                  🚪 Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Taskbar;