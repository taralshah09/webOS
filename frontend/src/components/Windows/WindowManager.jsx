import React, { useState, useCallback } from 'react';
import Window from './Window';
import './WindowManager.css';

const WindowManager = ({ children }) => {
  const [windows, setWindows] = useState([]);
  const [nextZIndex, setNextZIndex] = useState(1);

  // Create a new window
  const createWindow = useCallback((windowConfig) => {
    const newWindow = {
      id: Date.now() + Math.random(),
      zIndex: nextZIndex,
      isFocused: true,
      isMaximized: false,
      isMinimized: false,
      ...windowConfig
    };

    setWindows(prev => {
      // Unfocus all other windows
      const updatedWindows = prev.map(w => ({ ...w, isFocused: false }));
      return [...updatedWindows, newWindow];
    });

    setNextZIndex(prev => prev + 1);
    return newWindow.id;
  }, [nextZIndex]);

  // Focus a window (bring to front)
  const focusWindow = useCallback((windowId) => {
    setWindows(prev => {
      const updatedWindows = prev.map(w => ({
        ...w,
        isFocused: w.id === windowId,
        zIndex: w.id === windowId ? nextZIndex : w.zIndex
      }));
      
      // Sort by z-index to ensure proper layering
      return updatedWindows.sort((a, b) => a.zIndex - b.zIndex);
    });
    
    setNextZIndex(prev => prev + 1);
  }, [nextZIndex]);

  // Close a window
  const closeWindow = useCallback((windowId) => {
    setWindows(prev => prev.filter(w => w.id !== windowId));
  }, []);

  // Minimize a window
  const minimizeWindow = useCallback((windowId) => {
    setWindows(prev => prev.map(w => 
      w.id === windowId ? { ...w, isMinimized: true } : w
    ));
  }, []);

  // Maximize/Restore a window
  const maximizeWindow = useCallback((windowId) => {
    setWindows(prev => prev.map(w => 
      w.id === windowId ? { ...w, isMaximized: !w.isMaximized } : w
    ));
  }, []);

  // Restore a minimized window
  const restoreWindow = useCallback((windowId) => {
    setWindows(prev => prev.map(w => 
      w.id === windowId ? { ...w, isMinimized: false } : w
    ));
  }, []);

  // Get all visible windows (not minimized)
  const visibleWindows = windows.filter(w => !w.isMinimized);

  // Get minimized windows
  const minimizedWindows = windows.filter(w => w.isMinimized);

  return (
    <div className="window-manager">
      {/* Render visible windows */}
      {visibleWindows.map((window) => (
        <Window
          key={window.id}
          id={window.id}
          title={window.title}
          initialPosition={window.initialPosition}
          initialSize={window.initialSize}
          minSize={window.minSize}
          isFocused={window.isFocused}
          isMaximized={window.isMaximized}
          zIndex={window.zIndex}
          onClose={closeWindow}
          onMinimize={minimizeWindow}
          onMaximize={maximizeWindow}
          onFocus={focusWindow}
        >
          {window.content}
        </Window>
      ))}
      
      {/* Render children with window manager context */}
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            createWindow,
            focusWindow,
            closeWindow,
            minimizeWindow,
            maximizeWindow,
            restoreWindow,
            windows,
            visibleWindows,
            minimizedWindows
          });
        }
        return child;
      })}
    </div>
  );
};

export default WindowManager; 