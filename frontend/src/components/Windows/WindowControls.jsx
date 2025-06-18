import React from 'react';
import './WindowControls.css';

const WindowControls = ({ onClose, onMinimize, onMaximize, isMaximized }) => {
  return (
    <div className="window-controls">
      <button 
        className="window-control minimize"
        onClick={onMinimize}
        title="Minimize"
      >
        <svg width="12" height="12" viewBox="0 0 12 12">
          <rect x="2" y="5" width="8" height="2" fill="currentColor" />
        </svg>
      </button>
      
      <button 
        className="window-control maximize"
        onClick={onMaximize}
        title={isMaximized ? "Restore" : "Maximize"}
      >
        {isMaximized ? (
          <svg width="12" height="12" viewBox="0 0 12 12">
            <path d="M3 3h3v1H4v2H3V3zm3 6H3V6h1v2h2v1zm3-3h-1V4H6V3h3v3z" fill="currentColor" />
          </svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 12 12">
            <rect x="2" y="2" width="8" height="8" fill="none" stroke="currentColor" strokeWidth="1" />
          </svg>
        )}
      </button>
      
      <button 
        className="window-control close"
        onClick={onClose}
        title="Close"
      >
        <svg width="12" height="12" viewBox="0 0 12 12">
          <path d="M3 3l6 6m0-6l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
};

export default WindowControls; 