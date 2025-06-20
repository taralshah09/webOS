import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './Auth.css';

const UserMenu = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  const handleToggle = (e) => {
    e.stopPropagation(); // Prevent event bubbling
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  const handleMenuItemClick = (e) => {
    e.stopPropagation(); // Prevent event bubbling
    // Add your menu item logic here
    setIsOpen(false);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (!user) return null;

  return (
    <div className="user-menu-standalone" ref={menuRef}>
      <img
        src="https://tinyurl.com/mr2mpjsk"
        alt={user.username}
        className="user-avatar"
        onClick={handleToggle}
        onError={(e) => {
          e.target.src = 'https://tinyurl.com/mr2mpjsk';
        }}
      />
      
      <div className={`user-dropdown ${isOpen ? 'show' : ''}`}>
        <div className="user-info">
          <div className="user-name">{user.username}</div>
          <div className="user-email">{user.email}</div>
        </div>
        
        <div className="user-dropdown-item" onClick={handleMenuItemClick}>
          <span>👤</span>
          Profile
        </div>
        
        <div className="user-dropdown-item" onClick={handleMenuItemClick}>
          <span>⚙️</span>
          Settings
        </div>
        
        <div className="user-dropdown-item logout" onClick={handleLogout}>
          <span>🚪</span>
          Sign Out
        </div>
      </div>
    </div>
  );
};

export default UserMenu;