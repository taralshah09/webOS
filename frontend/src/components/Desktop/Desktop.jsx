import React, { useState, useRef, useEffect } from 'react';
import './Desktop.css';
import DesktopIcon from './DesktopIcon';
import ContextMenu from './ContextMenu';
import Notepad from '../Applications/Notepad';
import FileExplorer from '../FileExplorer/FileExplorer';
import fileService from '../../services/fileService';
import Browser from '../Applications/Browser';
import Terminal from '../Applications/Terminal';

const Desktop = ({ createWindow }) => {
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0 });
  const [desktopIcons, setDesktopIcons] = useState([
    {
      id: 1,
      name: 'My Computer',
      icon: '🖥️',
      x: 50,
      y: 50,
      type: 'computer'
    },
    {
      id: 2,
      name: 'Documents',
      icon: '📁',
      x: 50,
      y: 150,
      type: 'folder'
    },
    {
      id: 3,
      name: 'Recycle Bin',
      icon: '🗑️',
      x: 50,
      y: 250,
      type: 'trash'
    },
    {
      id: 4,
      name: 'Settings',
      icon: '⚙️',
      x: 50,
      y: 350,
      type: 'settings'
    },
    {
      id: 5,
      name: 'Notepad',
      icon: '📝',
      x: 50,
      y: 450,
      type: 'notepad'
    },
    {
      id: 6,
      name: 'File Explorer',
      icon: '📂',
      x: 50,
      y: 550,
      type: 'fileexplorer'
    },
    {
      id: 7,
      name: 'Browser',
      icon: '🌐',
      x: 50,
      y: 650,
      type: 'browser'
    },
    {
      id: 8,
      name: 'Terminal',
      icon: '🖳',
      x: 50,
      y: 750,
      type: 'terminal'
    }
  ]);

  const desktopRef = useRef(null);

  // Listen for file opening events
  useEffect(() => {
    const unsubscribe = fileService.addListener((event) => {
      if (event.type === 'OPEN_FILE') {
        handleFileOpen(event);
      }
    });

    return unsubscribe;
  }, []);

  const handleFileOpen = (fileEvent) => {
    const { filePath, fileContent, fileType } = fileEvent;
    
    // Create a new Notepad window with the file content
    createWindow({
      title: `${filePath.split('/').pop()} - Notepad`,
      content: <Notepad initialContent={fileContent} initialFilePath={filePath} initialLanguage={fileType} />,
      initialPosition: { x: 100 + Math.random() * 100, y: 100 + Math.random() * 100 },
      initialSize: { width: 800, height: 600 },
      minSize: { width: 400, height: 300 }
    });
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY
    });
  };

  const handleClick = () => {
    setContextMenu({ visible: false, x: 0, y: 0 });
  };

  const handleIconMove = (id, newX, newY) => {
    setDesktopIcons(prev => 
      prev.map(icon => 
        icon.id === id ? { ...icon, x: newX, y: newY } : icon
      )
    );
  };

  const handleIconDoubleClick = (icon) => {
    switch (icon.type) {
      case 'notepad':
        createWindow({
          title: 'Notepad',
          content: <Notepad />,
          initialPosition: { x: 100, y: 100 },
          initialSize: { width: 600, height: 400 },
          minSize: { width: 300, height: 200 }
        });
        break;
      case 'fileexplorer':
        createWindow({
          title: 'File Explorer',
          content: <FileExplorer />,
          initialPosition: { x: 150, y: 150 },
          initialSize: { width: 800, height: 600 },
          minSize: { width: 600, height: 400 }
        });
        break;
      case 'browser':
        createWindow({
          title: 'Web Browser',
          content: <Browser />,
          initialPosition: { x: 200, y: 200 },
          initialSize: { width: 900, height: 600 },
          minSize: { width: 400, height: 300 }
        });
        break;
      case 'terminal':
        createWindow({
          title: 'Terminal',
          content: <Terminal />,
          initialPosition: { x: 250, y: 250 },
          initialSize: { width: 700, height: 400 },
          minSize: { width: 400, height: 250 }
        });
        break;
      case 'computer':
        createWindow({
          title: 'My Computer',
          content: <div style={{ padding: '20px', color: 'white' }}>My Computer - Coming Soon</div>,
          initialPosition: { x: 200, y: 200 },
          initialSize: { width: 500, height: 300 },
          minSize: { width: 400, height: 250 }
        });
        break;
      case 'folder':
        createWindow({
          title: 'Documents',
          content: <div style={{ padding: '20px', color: 'white' }}>Documents Folder - Coming Soon</div>,
          initialPosition: { x: 250, y: 250 },
          initialSize: { width: 500, height: 300 },
          minSize: { width: 400, height: 250 }
        });
        break;
      case 'settings':
        createWindow({
          title: 'Settings',
          content: <div style={{ padding: '20px', color: 'white' }}>Settings - Coming Soon</div>,
          initialPosition: { x: 300, y: 300 },
          initialSize: { width: 500, height: 300 },
          minSize: { width: 400, height: 250 }
        });
        break;
      default:
        console.log(`Opening ${icon.name}`);
        break;
    }
  };

  const handleContextMenuAction = (action) => {
    switch (action) {
      case 'new-folder': {
        const newFolder = {
          id: Date.now(),
          name: 'New Folder',
          icon: '📁',
          x: Math.random() * 200 + 50,
          y: Math.random() * 200 + 50,
          type: 'folder'
        };
        setDesktopIcons(prev => [...prev, newFolder]);
        break;
      }
      case 'refresh':
        // Refresh desktop (could reload icons or reset positions)
        break;
      case 'view':
        // Change view mode (icons, list, details)
        break;
      default:
        break;
    }
    setContextMenu({ visible: false, x: 0, y: 0 });
  };

  useEffect(() => {
    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <div 
      ref={desktopRef}
      className="desktop"
      onContextMenu={handleContextMenu}
    >
      {/* Desktop Background */}
      <div className="desktop-background"></div>
      
      {/* Desktop Icons */}
      {desktopIcons.map(icon => (
        <DesktopIcon
          key={icon.id}
          icon={icon}
          onMove={handleIconMove}
          onDoubleClick={() => handleIconDoubleClick(icon)}
        />
      ))}
      
      {/* Context Menu */}
      {contextMenu.visible && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onAction={handleContextMenuAction}
        />
      )}
    </div>
  );
};

export default Desktop; 