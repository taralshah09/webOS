import React, { useState, useRef } from 'react';
import './DesktopIcon.css';

const DesktopIcon = ({ icon, onMove, onDoubleClick, onContextMenu }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const iconRef = useRef(null);

  const handleMouseDown = (e) => {
    if (e.button === 0) { // Left click only
      e.preventDefault();
      setIsDragging(true);
      setIsSelected(true);
      
      const rect = iconRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      e.preventDefault();
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      // Keep icon within desktop bounds
      const maxX = window.innerWidth - 80;
      const maxY = window.innerHeight - 100;
      
      const clampedX = Math.max(10, Math.min(newX, maxX));
      const clampedY = Math.max(10, Math.min(newY, maxY));
      
      onMove(icon.id, clampedX, clampedY);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleDoubleClick = () => {
    console.log('DesktopIcon: Double-click event triggered for icon:', icon);
    if (onDoubleClick) {
      console.log('DesktopIcon: Calling onDoubleClick with icon:', icon);
      onDoubleClick(icon);
    }
  };

  const handleClick = () => {
    if (!isDragging) {
      setIsSelected(true);
    }
  };

  // Add global mouse event listeners
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  // Deselect icon when clicking elsewhere
  React.useEffect(() => {
    const handleGlobalClick = (e) => {
      if (iconRef.current && !iconRef.current.contains(e.target)) {
        setIsSelected(false);
      }
    };

    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, []);

  return (
    <div
      ref={iconRef}
      className={`desktop-icon ${isDragging ? 'dragging' : ''} ${isSelected ? 'selected' : ''}`}
      style={{
        left: `${icon.x}px`,
        top: `${icon.y}px`
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      onClick={handleClick}
      onContextMenu={e => onContextMenu && onContextMenu(e, icon)}
    >
      <div className="icon-image">
        <span className="icon-emoji">{icon.icon}</span>
      </div>
      <div className="icon-label">
        {icon.name}
      </div>
    </div>
  );
};

export default DesktopIcon; 