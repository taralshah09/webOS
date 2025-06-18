import React, { useState, useRef, useEffect } from 'react';
import './Window.css';
import WindowControls from './WindowControls';

const Window = ({ 
  id, 
  title, 
  children, 
  initialPosition = { x: 100, y: 100 }, 
  initialSize = { width: 400, height: 300 },
  minSize = { width: 200, height: 150 },
  onClose, 
  onMinimize, 
  onMaximize, 
  onFocus,
  isFocused = false,
  isMaximized = false,
  zIndex = 1
}) => {
  const [position, setPosition] = useState(initialPosition);
  const [size, setSize] = useState(initialSize);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeDirection, setResizeDirection] = useState(null);
  const [originalSize, setOriginalSize] = useState(initialSize);
  const [originalPosition, setOriginalPosition] = useState(initialPosition);
  
  const windowRef = useRef(null);
  const headerRef = useRef(null);

  // Handle window dragging
  const handleMouseDown = (e) => {
    if (e.target.closest('.window-controls') || e.target.closest('.window-resize-handle')) {
      return;
    }
    
    if (e.button === 0) { // Left click only
      e.preventDefault();
      setIsDragging(true);
      onFocus(id);
      
      const rect = headerRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  // Handle window resizing
  const handleResizeMouseDown = (e, direction) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeDirection(direction);
    onFocus(id);
  };

  // Global mouse move handler
  const handleMouseMove = (e) => {
    if (isDragging && !isMaximized) {
      e.preventDefault();
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      // Keep window within viewport bounds
      const maxX = window.innerWidth - size.width;
      const maxY = window.innerHeight - size.height;
      
      const clampedX = Math.max(0, Math.min(newX, maxX));
      const clampedY = Math.max(0, Math.min(newY, maxY));
      
      setPosition({ x: clampedX, y: clampedY });
    }
    
    if (isResizing && !isMaximized) {
      e.preventDefault();
      const rect = windowRef.current.getBoundingClientRect();
      const newSize = { ...size };
      const newPosition = { ...position };
      
      if (resizeDirection.includes('e')) {
        const newWidth = Math.max(minSize.width, e.clientX - rect.left);
        newSize.width = newWidth;
      }
      
      if (resizeDirection.includes('w')) {
        const newWidth = Math.max(minSize.width, rect.right - e.clientX);
        const deltaWidth = size.width - newWidth;
        newSize.width = newWidth;
        newPosition.x = position.x + deltaWidth;
      }
      
      if (resizeDirection.includes('s')) {
        const newHeight = Math.max(minSize.height, e.clientY - rect.top);
        newSize.height = newHeight;
      }
      
      if (resizeDirection.includes('n')) {
        const newHeight = Math.max(minSize.height, rect.bottom - e.clientY);
        const deltaHeight = size.height - newHeight;
        newSize.height = newHeight;
        newPosition.y = position.y + deltaHeight;
      }
      
      // Keep window within viewport bounds
      const maxX = window.innerWidth - newSize.width;
      const maxY = window.innerHeight - newSize.height;
      
      newPosition.x = Math.max(0, Math.min(newPosition.x, maxX));
      newPosition.y = Math.max(0, Math.min(newPosition.y, maxY));
      
      setSize(newSize);
      setPosition(newPosition);
    }
  };

  // Global mouse up handler
  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeDirection(null);
  };

  // Handle maximize/restore
  const handleMaximize = () => {
    if (isMaximized) {
      // Restore to original size and position
      setSize(originalSize);
      setPosition(originalPosition);
    } else {
      // Maximize
      setOriginalSize(size);
      setOriginalPosition(position);
      setSize({ width: window.innerWidth, height: window.innerHeight });
      setPosition({ x: 0, y: 0 });
    }
    onMaximize(id);
  };

  // Add global event listeners
  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragOffset, resizeDirection, position, size, isMaximized]);

  const windowStyle = {
    left: `${position.x}px`,
    top: `${position.y}px`,
    width: isMaximized ? '100vw' : `${size.width}px`,
    height: isMaximized ? '100vh' : `${size.height}px`,
    zIndex: isFocused ? 1000 : zIndex
  };

  return (
    <div
      ref={windowRef}
      className={`window ${isFocused ? 'focused' : ''} ${isMaximized ? 'maximized' : ''}`}
      style={windowStyle}
    >
      {/* Window Header */}
      <div 
        ref={headerRef}
        className="window-header"
        onMouseDown={handleMouseDown}
      >
        <div className="window-title">{title}</div>
        <WindowControls
          onClose={() => onClose(id)}
          onMinimize={() => onMinimize(id)}
          onMaximize={handleMaximize}
          isMaximized={isMaximized}
        />
      </div>
      
      {/* Window Content */}
      <div className="window-content">
        {children}
      </div>
      
      {/* Resize Handles */}
      {!isMaximized && (
        <>
          <div className="window-resize-handle n" onMouseDown={(e) => handleResizeMouseDown(e, 'n')} />
          <div className="window-resize-handle s" onMouseDown={(e) => handleResizeMouseDown(e, 's')} />
          <div className="window-resize-handle e" onMouseDown={(e) => handleResizeMouseDown(e, 'e')} />
          <div className="window-resize-handle w" onMouseDown={(e) => handleResizeMouseDown(e, 'w')} />
          <div className="window-resize-handle ne" onMouseDown={(e) => handleResizeMouseDown(e, 'ne')} />
          <div className="window-resize-handle nw" onMouseDown={(e) => handleResizeMouseDown(e, 'nw')} />
          <div className="window-resize-handle se" onMouseDown={(e) => handleResizeMouseDown(e, 'se')} />
          <div className="window-resize-handle sw" onMouseDown={(e) => handleResizeMouseDown(e, 'sw')} />
        </>
      )}
    </div>
  );
};

export default Window; 
