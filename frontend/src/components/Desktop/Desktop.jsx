import React, { useState, useRef, useEffect } from 'react';
import './Desktop.css';
import DesktopIcon from './DesktopIcon';
import ContextMenu from './ContextMenu';
import Taskbar from '../Taskbar/Taskbar';
import Notepad from '../Applications/Notepad';
import FileExplorer from '../FileExplorer/FileExplorer';
import Browser from '../Applications/Browser';
import Terminal from '../Applications/Terminal';
import fileService from '../../services/fileService';
import { getDesktop, updateIconPosition, updateDesktopIcons } from '../../services/desktopService';
import { useAuth } from '../../contexts/AuthContext';
import { useFileSystem } from '../../contexts/FileSystemContext';
import '../../styles/theme.css';
import WallpaperModal from './WallpaperModal';

const Desktop = ({ 
  createWindow, 
  windows = [], 
  onWindowFocus, 
  onWindowMinimize,
  onWindowMaximize, 
  onWindowClose,
  onStartMenuAction 
}) => {
  const { token } = useAuth();
  const fileSystemContext = useFileSystem();
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0 });
  const [iconContextMenu, setIconContextMenu] = useState({ visible: false, x: 0, y: 0, icon: null });
  const [desktopIcons, setDesktopIcons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wallpaper, setWallpaper] = useState(() => localStorage.getItem('desktopWallpaper') || '');
  const [showWallpaperModal, setShowWallpaperModal] = useState(false);

  const desktopRef = useRef(null);

  // Set up file service context
  useEffect(() => {
    fileService.setFileSystemContext(fileSystemContext);
  }, [fileSystemContext]);

  // Fetch desktop configuration on mount
  useEffect(() => {
    const fetchDesktop = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await getDesktop(token);

        if (response.success && response.data) {
          const transformedIcons = response.data.desktopIcons?.map(icon => ({
            id: icon._id,
            name: icon.appId?.displayName || 'Unknown App',
            icon: icon.appId?.icon || '📄',
            x: icon.position?.x || 50,
            y: icon.position?.y || 50,
            type: icon.appId?.name || 'unknown',
            visible: icon.visible !== false
          })) || [];

          setDesktopIcons(transformedIcons);
        }
      } catch (err) {
        console.error('Error fetching desktop:', err);
        setError(err.message);
        // Fallback to default icons
        setDesktopIcons([
          { id: 1, name: 'My Computer', icon: '🖥️', x: 50, y: 50, type: 'computer' },
          { id: 2, name: 'Documents', icon: '📁', x: 50, y: 100, type: 'folder' },
          { id: 3, name: 'Recycle Bin', icon: '🗑️', x: 50, y: 150, type: 'trash' },
          { id: 4, name: 'Settings', icon: '⚙️', x: 50, y: 250, type: 'settings' },
          { id: 5, name: 'Notepad', icon: '📝', x: 50, y: 350, type: 'notepad' },
          { id: 6, name: 'File Explorer', icon: '📂', x: 50, y: 450, type: 'file-explorer' },
          { id: 7, name: 'Browser', icon: '🌐', x: 50, y: 550, type: 'browser' },
          { id: 8, name: 'Terminal', icon: '🖳', x: 50, y: 650, type: 'terminal' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchDesktop();
  }, [token]);

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
    
    // Check if there's already a window open with this file
    const existingWindow = windows.find(w => 
      w.title.includes(filePath.split('/').pop()) && w.title.includes('Notepad')
    );

    if (existingWindow) {
      // Focus the existing window
      onWindowFocus && onWindowFocus(existingWindow.id);
      return;
    }

    // Create a new Notepad window with file content and enhanced title callback
    const windowId = createWindow({
      title: `${filePath.split('/').pop()} - Notepad`,
      content: <Notepad 
        initialContent={fileContent} 
        initialFilePath={filePath} 
        initialLanguage={fileType}
        onTitleChange={(newTitle) => {
          // Update window title when file is modified
          // This would need to be implemented in your window manager
          console.log('Window title should update to:', newTitle);
        }}
      />,
      initialPosition: { x: 100 + Math.random() * 100, y: 100 + Math.random() * 100 },
      initialSize: { width: 900, height: 650 },
      minSize: { width: 600, height: 400 }
    });

    console.log(`📝 Opened file in Notepad: ${filePath}`);
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    setContextMenu({ visible: true, x: e.clientX, y: e.clientY });
  };

  const handleClick = () => {
    setContextMenu({ visible: false, x: 0, y: 0 });
  };

  const handleIconMove = async (id, newX, newY) => {
    setDesktopIcons(prev =>
      prev.map(icon =>
        icon.id === id ? { ...icon, x: newX, y: newY } : icon
      )
    );

    if (token) {
      try {
        await updateIconPosition(id, { x: newX, y: newY }, token);
      } catch (err) {
        console.error('Error updating icon position:', err);
      }
    }
  };

  const handleIconDoubleClick = (icon) => {
    // Check if app is already running
    const existingWindow = windows.find(w => {
      const appName = icon.name.toLowerCase();
      const windowTitle = w.title.toLowerCase();
      
      return windowTitle.includes(appName) ||
             (icon.type === 'file-explorer' && windowTitle.includes('file explorer')) ||
             (icon.type === 'notepad' && windowTitle.includes('notepad')) ||
             (icon.type === 'browser' && windowTitle.includes('browser')) ||
             (icon.type === 'terminal' && windowTitle.includes('terminal'));
    });

    if (existingWindow) {
      // Focus existing window
      onWindowFocus && onWindowFocus(existingWindow.id);
      return;
    }

    // Create new window with enhanced configurations
    const appConfigs = {
      notepad: {
        title: 'Notepad',
        content: <Notepad />,
        initialPosition: { x: 100, y: 100 },
        initialSize: { width: 900, height: 650 },
        minSize: { width: 600, height: 400 }
      },
      'file-explorer': {
        title: 'File Explorer',
        content: <FileExplorer />,
        initialPosition: { x: 150, y: 150 },
        initialSize: { width: 1000, height: 700 },
        minSize: { width: 800, height: 500 }
      },
      browser: {
        title: 'Web Browser',
        content: <Browser />,
        initialPosition: { x: 200, y: 200 },
        initialSize: { width: 1100, height: 700 },
        minSize: { width: 600, height: 400 }
      },
      terminal: {
        title: 'Terminal',
        content: <Terminal />,
        initialPosition: { x: 250, y: 250 },
        initialSize: { width: 800, height: 500 },
        minSize: { width: 500, height: 300 }
      },
      computer: {
        title: 'My Computer',
        content: <div style={{ padding: '20px', color: 'white' }}>
          <h2>My Computer</h2>
          <p>System Information:</p>
          <ul>
            <li>OS: WebOS 1.0</li>
            <li>Browser: {navigator.userAgent.split(' ')[0]}</li>
            <li>Platform: {navigator.platform}</li>
            <li>Language: {navigator.language}</li>
          </ul>
        </div>,
        initialPosition: { x: 200, y: 200 },
        initialSize: { width: 500, height: 300 },
        minSize: { width: 400, height: 250 }
      },
      folder: {
        title: 'Documents',
        content: <FileExplorer />,
        initialPosition: { x: 250, y: 250 },
        initialSize: { width: 1000, height: 700 },
        minSize: { width: 800, height: 500 }
      },
      settings: {
        title: 'Settings',
        content: <div style={{ padding: '20px', color: 'white' }}>
          <h2>System Settings</h2>
          <p>Configure your WebOS experience:</p>
          <ul>
            <li>Display Settings</li>
            <li>File System Options</li>
            <li>User Preferences</li>
            <li>Application Settings</li>
          </ul>
          <p><em>Settings panel coming soon...</em></p>
        </div>,
        initialPosition: { x: 300, y: 300 },
        initialSize: { width: 600, height: 400 },
        minSize: { width: 500, height: 300 }
      }
    };

    const config = appConfigs[icon.type];
    if (config) {
      createWindow(config);
    }
  };

  const handleWallpaperChange = (url) => {
    setWallpaper(url);
    if (url) {
      localStorage.setItem('desktopWallpaper', url);
    } else {
      localStorage.removeItem('desktopWallpaper');
    }
    setShowWallpaperModal(false);
  };

  const handleContextMenuAction = async (action) => {
    switch (action) {
      case 'change-wallpaper':
        setShowWallpaperModal(true);
        break;
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
      case 'new-text-file': {
        // Create a new text file on desktop and open it in Notepad
        const fileName = prompt('Enter file name:', 'New Document.txt');
        if (fileName && fileName.trim()) {
          try {
            const filePath = `/Desktop/${fileName.trim()}`;
            await fileSystemContext.createFile(fileName.trim(), '', '/Desktop');
            
            // Open the new file in Notepad
            fileService.openFile(filePath, '', 'text');
          } catch (error) {
            alert(`Error creating file: ${error.message}`);
          }
        }
        break;
      }
      case 'refresh':
        window.location.reload();
        break;
      default:
        break;
    }
    setContextMenu({ visible: false, x: 0, y: 0 });
  };

  const handleIconContextMenu = (e, icon) => {
    e.preventDefault();
    setIconContextMenu({ visible: true, x: e.clientX, y: e.clientY, icon });
  };

  const handleIconContextMenuAction = (action) => {
    if (!iconContextMenu.icon) return;
    if (action === 'open') {
      handleIconDoubleClick(iconContextMenu.icon);
    }
    setIconContextMenu({ visible: false, x: 0, y: 0, icon: null });
  };

  useEffect(() => {
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return (
    <div ref={desktopRef} className="desktop" onContextMenu={handleContextMenu}>
      {/* Desktop Background */}
      <div
        className="desktop-background"
        style={wallpaper ? {
          backgroundImage: `url(${wallpaper})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        } : {}}
      />

      {/* Loading State */}
      {loading && (
        <div className="desktop-loading">
          <div className="loading-spinner"></div>
          <p>Loading desktop...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="desktop-error">
          <p>Error loading desktop: {error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      )}

      {/* Desktop Icons */}
      {!loading && !error && desktopIcons.map(icon => (
        <DesktopIcon
          key={icon.id}
          icon={icon}
          onMove={handleIconMove}
          onDoubleClick={() => handleIconDoubleClick(icon)}
          onContextMenu={handleIconContextMenu}
        />
      ))}

      {/* Context Menus */}
      {iconContextMenu.visible && (
        <ContextMenu
          x={iconContextMenu.x}
          y={iconContextMenu.y}
          onAction={handleIconContextMenuAction}
          menuType="icon"
        />
      )}

      {contextMenu.visible && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onAction={handleContextMenuAction}
        />
      )}

      {/* Wallpaper Modal */}
      {showWallpaperModal && (
        <WallpaperModal
          currentWallpaper={wallpaper}
          onWallpaperChange={handleWallpaperChange}
          onClose={() => setShowWallpaperModal(false)}
        />
      )}

      {/* Enhanced Taskbar */}
      <Taskbar
        windows={windows}
        onWindowFocus={onWindowFocus}
        onWindowMinimize={onWindowMinimize}
        onWindowClose={onWindowClose}
        createWindow={createWindow}
        onStartMenuAction={onStartMenuAction}
      />
    </div>
  );
};

export default Desktop;