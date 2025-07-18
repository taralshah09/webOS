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
import '../../styles/theme.css';
import WallpaperModal from './WallpaperModal';
import { FileSystemProvider } from '../../contexts/FileSystemContext';

const Desktop = ({ createWindow, windows = [], onWindowFocus, onWindowMinimize }) => {
  // const { token } = useAuth();
  const token = localStorage.getItem("webos_token");
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0 });
  const [iconContextMenu, setIconContextMenu] = useState({ visible: false, x: 0, y: 0, icon: null });
  const [desktopIcons, setDesktopIcons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wallpaper, setWallpaper] = useState(() => localStorage.getItem('desktopWallpaper') || '');
  const [showWallpaperModal, setShowWallpaperModal] = useState(false);

  const desktopRef = useRef(null);

  // Fetch desktop configuration on mount
  useEffect(() => {
    const fetchDesktop = async () => {
      if (!token) {
        console.log('No token available, using default desktop icons');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('Fetching desktop configuration from backend...');
        const response = await getDesktop(token);

        if (response.success && response.data) {
          // Transform backend data to match frontend format
          const transformedIcons = response.data.desktopIcons?.map(icon => ({
            id: icon._id,
            name: icon.appId?.displayName || 'Unknown App',
            icon: icon.appId?.icon || '📄',
            x: icon.position?.x || 50,
            y: icon.position?.y || 50,
            type: icon.appId?.name || 'unknown',
            visible: icon.visible !== false
          })) || [];

          console.log('✅ Loaded desktop icons from backend:', transformedIcons);
          setDesktopIcons(transformedIcons);
        } else {
          console.log('No backend data, using default icons');
          setDefaultIcons();
        }
      } catch (err) {
        console.error('❌ Error fetching desktop from backend:', err);
        console.log('Using default desktop icons as fallback');
        setDefaultIcons();
      } finally {
        setLoading(false);
      }
    };

    const setDefaultIcons = () => {
      setDesktopIcons([
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
          y: 100,
          type: 'folder'
        },
        {
          id: 3,
          name: 'Recycle Bin',
          icon: '🗑️',
          x: 50,
          y: 150,
          type: 'trash'
        },
        {
          id: 4,
          name: 'Settings',
          icon: '⚙️',
          x: 50,
          y: 250,
          type: 'settings'
        },
        {
          id: 5,
          name: 'Notepad',
          icon: '📝',
          x: 50,
          y: 350,
          type: 'notepad'
        },
        {
          id: 6,
          name: 'File Explorer',
          icon: '📂',
          x: 50,
          y: 450,
          type: 'file-explorer'
        },
        {
          id: 7,
          name: 'Browser',
          icon: '🌐',
          x: 50,
          y: 550,
          type: 'browser'
        },
        {
          id: 8,
          name: 'Terminal',
          icon: '🖳',
          x: 50,
          y: 650,
          type: 'terminal'
        }
      ]);
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

    // **NEW: Validate filePath is a string**
    const fileName = typeof filePath === 'string' ? filePath.split('/').pop() : 'Unknown File';

    // Create a new Notepad window with the file content
    createWindow({
      title: `${fileName} - Notepad`,
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

  const handleIconMove = async (id, newX, newY) => {
    // Update local state immediately for responsive UI
    setDesktopIcons(prev =>
      prev.map(icon =>
        icon.id === id ? { ...icon, x: newX, y: newY } : icon
      )
    );

    // Persist to backend
    if (token) {
      try {
        await updateIconPosition(id, { x: newX, y: newY }, token);
      } catch (err) {
        console.error('Error updating icon position:', err);
        // Optionally revert the position change on error
        // setDesktopIcons(prev => 
        //   prev.map(icon => 
        //     icon.id === id ? { ...icon, x: oldX, y: oldY } : icon
        //   )
        // );
      }
    }
  };

  const handleIconDoubleClick = (icon) => {
    console.log('handleIconDoubleClick called with icon:', icon);
    console.log('Icon type:', icon.type);

    switch (icon.type) {
      case 'notepad':
        console.log('Opening Notepad');
        createWindow({
          title: 'Notepad',
          content: <Notepad />,
          initialPosition: { x: 100, y: 100 },
          initialSize: { width: 600, height: 400 },
          minSize: { width: 300, height: 200 }
        });
        break;
      case 'fileexplorer':
      case 'file-explorer':
        console.log('Opening File Explorer window');
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
      case 'my-computer':
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

        const updatedIcons = [...desktopIcons, newFolder];
        setDesktopIcons(updatedIcons);

        // Persist to backend if token is available
        if (token) {
          try {
            // Transform frontend format to backend format
            const backendIcons = updatedIcons.map(icon => ({
              _id: icon.id,
              appId: { _id: icon.id, displayName: icon.name, icon: icon.icon, name: icon.type },
              position: { x: icon.x, y: icon.y },
              visible: icon.visible !== false
            }));

            await updateDesktopIcons(backendIcons, token);
          } catch (err) {
            console.error('Error updating desktop icons:', err);
            // Optionally revert the change on error
            setDesktopIcons(desktopIcons);
          }
        }
        break;
      }
      case 'refresh':
        // Refresh desktop (could reload icons or reset positions)
        window.location.reload();
        break;
      case 'view':
        // Change view mode (icons, list, details)
        break;
      default:
        break;
    }
    setContextMenu({ visible: false, x: 0, y: 0 });
  };

  // Right-click handler for desktop icons
  const handleIconContextMenu = (e, icon) => {
    e.preventDefault();
    setIconContextMenu({ visible: true, x: e.clientX, y: e.clientY, icon });
  };

  // Handle icon context menu actions
  const handleIconContextMenuAction = (action) => {
    if (!iconContextMenu.icon) return;
    if (action === 'open') {
      handleIconDoubleClick(iconContextMenu.icon);
    }
    // Add more actions here (view, properties, etc.)
    setIconContextMenu({ visible: false, x: 0, y: 0, icon: null });
  };

  // Handle taskbar window creation from start menu
  const handleTaskbarCreateWindow = (config) => {
    const componentMap = {
      notepad: <Notepad />,
      fileexplorer: <FileExplorer />,
      browser: <Browser />,
      terminal: <Terminal />,
      calculator: <div style={{ padding: '20px', color: 'white' }}>Calculator - Coming Soon</div>,
      settings: <div style={{ padding: '20px', color: 'white' }}>Settings - Coming Soon</div>
    };

    createWindow({
      title: config.title,
      content: componentMap[config.content] || <div>Unknown App</div>,
      initialPosition: config.initialPosition,
      initialSize: config.initialSize,
      minSize: config.minSize
    });
  };

  // Handle start menu actions (lock, restart, shutdown)
  const handleStartMenuAction = (action) => {
    switch (action) {
      case 'lock':
        // Implement lock screen functionality
        console.log('Locking screen...');
        break;
      case 'restart':
        // Implement restart functionality
        console.log('Restarting...');
        if (window.confirm('Are you sure you want to restart?')) {
          window.location.reload();
        }
        break;
      case 'shutdown':
        // Implement shutdown functionality
        console.log('Shutting down...');
        if (window.confirm('Are you sure you want to shut down?')) {
          // You could redirect to login or show a shutdown screen
          window.close();
        }
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <FileSystemProvider>
      <div
        ref={desktopRef}
        className="desktop"
        onContextMenu={handleContextMenu}
      >
        {/* Desktop Background */}
        <div
          className="desktop-background"
          style={wallpaper ? {
            backgroundImage: `url(${wallpaper})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          } : {}}
        ></div>

        {/* Loading State */}
        {loading && (
          <div className="desktop-loading">
            <div className="loading-spinner"></div>
            <p>Loading desktop...</p>
          </div>
        )}

        {/* Desktop Icons */}
        {!loading && desktopIcons.map(icon => (
          <DesktopIcon
            key={icon.id}
            icon={icon}
            onMove={handleIconMove}
            onDoubleClick={() => handleIconDoubleClick(icon)}
            onContextMenu={handleIconContextMenu}
          />
        ))}

        {/* Icon Context Menu */}
        {iconContextMenu.visible && (
          <ContextMenu
            x={iconContextMenu.x}
            y={iconContextMenu.y}
            onAction={handleIconContextMenuAction}
            menuType="icon"
          />
        )}

        {/* Desktop Context Menu */}
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

        {/* Taskbar */}

        <Taskbar
          windows={windows}
          onWindowFocus={onWindowFocus}
          onWindowMinimize={onWindowMinimize}
          createWindow={handleTaskbarCreateWindow}
          onStartMenuAction={handleStartMenuAction}
        />

      </div>
    </FileSystemProvider>
  );
};

export default Desktop;