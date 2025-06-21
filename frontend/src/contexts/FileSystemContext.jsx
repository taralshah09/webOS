import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';

const FileSystemContext = createContext();

export const useFileSystem = () => {
  const context = useContext(FileSystemContext);
  if (!context) {
    throw new Error('useFileSystem must be used within a FileSystemProvider');
  }
  return context;
};

export const FileSystemProvider = ({ children }) => {
  const { token, isAuthenticated, user } = useAuth();
  const [fileSystem, setFileSystem] = useState({});
  const [currentPath, setCurrentPath] = useState('/');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize file system with default structure
  useEffect(() => {
    if (isAuthenticated()) {
      // Load from backend if authenticated, otherwise use default
      loadFromBackend().catch(() => {
        initializeFileSystem();
      });
    } else {
      initializeFileSystem();
    }
  }, [isAuthenticated]);

  const initializeFileSystem = useCallback(() => {
    const defaultFileSystem = {
      '/': {
        name: 'Root',
        type: 'folder',
        path: '/',
        children: ['/Documents', '/Downloads', '/Pictures', '/Desktop'],
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
        size: 0
      },
      '/Documents': {
        name: 'Documents',
        type: 'folder',
        path: '/Documents',
        children: ['/Documents/readme.txt', '/Documents/notes.md'],
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
        size: 0
      },
      '/Documents/readme.txt': {
        name: 'readme.txt',
        type: 'file',
        path: '/Documents/readme.txt',
        extension: 'txt',
        content: 'Welcome to WebOS File System!\n\nThis is a sample text file that demonstrates the file editing capabilities.\n\nYou can:\n- Double-click to open in the text editor\n- Edit the content\n- Save changes back to the file system\n- Create new files and folders\n\nEnjoy exploring your virtual file system!',
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
        size: 384
      },
      '/Documents/notes.md': {
        name: 'notes.md',
        type: 'file',
        path: '/Documents/notes.md',
        extension: 'md',
        content: '# My Notes\n\nThis is a **Markdown** file that showcases syntax highlighting.\n\n## Features\n- Rich text editing\n- Syntax highlighting\n- File system integration\n- Auto-save functionality\n\n### Code Example\n```javascript\nconst greeting = "Hello, WebOS!";\nconsole.log(greeting);\n```\n\n*Start typing to see the editor in action!*',
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
        size: 298
      },
      '/Downloads': {
        name: 'Downloads',
        type: 'folder',
        path: '/Downloads',
        children: [],
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
        size: 0
      },
      '/Pictures': {
        name: 'Pictures',
        type: 'folder',
        path: '/Pictures',
        children: [],
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
        size: 0
      },
      '/Desktop': {
        name: 'Desktop',
        type: 'folder',
        path: '/Desktop',
        children: ['/Desktop/sample.js'],
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
        size: 0
      },
      '/Desktop/sample.js': {
        name: 'sample.js',
        type: 'file',
        path: '/Desktop/sample.js',
        extension: 'js',
        content: '// Sample JavaScript file\n// This demonstrates syntax highlighting for code files\n\nclass WebOSDemo {\n  constructor() {\n    this.name = "WebOS File System Demo";\n    this.version = "1.0.0";\n  }\n\n  greet() {\n    console.log(`Welcome to ${this.name} v${this.version}!`);\n    return "File editing is now integrated!";\n  }\n\n  async saveFile(path, content) {\n    try {\n      // This would save to the backend\n      await fetch("/api/files", {\n        method: "POST",\n        headers: { "Content-Type": "application/json" },\n        body: JSON.stringify({ path, content })\n      });\n      console.log("File saved successfully!");\n    } catch (error) {\n      console.error("Save failed:", error);\n    }\n  }\n}\n\nconst demo = new WebOSDemo();\ndemo.greet();',
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
        size: 748
      }
    };

    setFileSystem(defaultFileSystem);
  }, []);

  // **NEW: Backend API helper**
  const apiCall = useCallback(async (url, options = {}) => {
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const fullUrl = `${apiBaseUrl}${url}`;
    
    console.log('🌐 Making API call:', {
      url: fullUrl,
      method: options.method || 'GET',
      hasToken: !!token,
      tokenLength: token ? token.length : 0
    });
    
    const response = await fetch(fullUrl, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
      ...options,
    });

    console.log('📡 API Response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      url: fullUrl
    });

    const result = await response.json();
    
    if (!response.ok) {
      console.error('❌ API Error:', {
        status: response.status,
        message: result.message,
        error: result.error
      });
      throw new Error(result.message || 'API request failed');
    }
    
    console.log('✅ API Success:', {
      url: fullUrl,
      dataKeys: result.data ? Object.keys(result.data) : 'no data'
    });
    
    return result;
  }, [token]);

  // **NEW: Manually initialize file system**
  const initializeFileSystemManually = useCallback(async () => {
    if (!token) {
      console.log('No token, cannot initialize file system');
      return;
    }
    
    try {
      console.log('🔄 Manually initializing file system...');
      setLoading(true);
      
      const result = await apiCall('/filesystem/initialize', {
        method: 'POST'
      });
      
      if (result.success) {
        console.log('✅ File system initialized successfully');
        // Reload the file system after initialization
        try {
          const reloadResult = await apiCall('/filesystem');
          if (reloadResult.data && reloadResult.data.fileSystem) {
            setFileSystem(reloadResult.data.fileSystem);
            console.log('✅ File system reloaded successfully');
          }
        } catch (reloadError) {
          console.error('❌ Error reloading file system:', reloadError);
          setError('File system initialized but failed to reload');
        }
      } else {
        console.error('❌ Failed to initialize file system');
        setError('Failed to initialize file system');
      }
    } catch (error) {
      console.error('❌ Error initializing file system:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [token, apiCall]);

  // **NEW: Test backend connectivity**
  const testBackendConnection = useCallback(async () => {
    try {
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiBaseUrl}/health`);
      const result = await response.json();
      
      console.log('🏥 Backend health check:', result);
      return result.success;
    } catch (error) {
      console.error('❌ Backend health check failed:', error);
      return false;
    }
  }, []);

  // **ENHANCED: Load file system from backend**
  const loadFromBackend = useCallback(async () => {
    if (!token) {
      console.log('❌ No token, skipping backend load');
      return;
    }
    
    console.log('🔐 Authentication check:', {
      hasToken: !!token,
      tokenLength: token.length,
      isAuthenticated: isAuthenticated(),
      user: user
    });
    
    // **NEW: Test backend connectivity first**
    const backendHealthy = await testBackendConnection();
    if (!backendHealthy) {
      console.error('❌ Backend is not reachable, using default file system');
      setError('Backend server is not reachable');
      initializeFileSystem();
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Loading file system from backend...');
      const result = await apiCall('/filesystem');
      
      console.log('📊 Backend response:', result);
      
      if (result.data && result.data.fileSystem) {
        const fileSystemData = result.data.fileSystem;
        const totalItems = result.data.totalItems || 0;
        
        console.log(`✅ File system loaded from backend: ${totalItems} items`);
        console.log('📁 File system structure:', Object.keys(fileSystemData));
        
        if (totalItems === 0 || Object.keys(fileSystemData).length === 0) {
          console.log('📁 Empty file system received, attempting to initialize...');
          // Try to initialize the file system manually
          try {
            const initResult = await apiCall('/filesystem/initialize', {
              method: 'POST'
            });
            
            if (initResult.success) {
              console.log('✅ File system initialized successfully');
              // Reload the file system after initialization
              const reloadResult = await apiCall('/filesystem');
              if (reloadResult.data && reloadResult.data.fileSystem) {
                setFileSystem(reloadResult.data.fileSystem);
              } else {
                setFileSystem(fileSystemData);
              }
            } else {
              console.log('📁 Using empty file system');
              setFileSystem(fileSystemData);
            }
          } catch (initError) {
            console.error('❌ Error initializing file system:', initError);
            setFileSystem(fileSystemData);
          }
        } else {
          setFileSystem(fileSystemData);
        }
      } else {
        console.log('📁 No backend file system found, using default');
        initializeFileSystem();
      }
      
    } catch (error) {
      console.error('❌ Error loading from backend:', error);
      setError(error.message);
      // Fallback to default file system
      initializeFileSystem();
    } finally {
      setLoading(false);
    }
  }, [token, apiCall, initializeFileSystem, isAuthenticated, user, testBackendConnection]);

  // **NEW: Refresh file system from backend (called by fileService)**
  const refreshFileSystem = useCallback(async () => {
    console.log('🔄 Refreshing file system...');
    await loadFromBackend();
  }, [loadFromBackend]);

  // **NEW: Update file content in local state (called by fileService)**
  const updateFileContent = useCallback((filePath, content) => {
    console.log('📝 Updating file content in frontend:', filePath);
    setFileSystem(prev => {
      const updated = { ...prev };
      if (updated[filePath]) {
        updated[filePath] = {
          ...updated[filePath],
          content: content,
          size: content.length,
          modified: new Date().toISOString()
        };
      }
      return updated;
    });
  }, []);

  // **NEW: Add file to local state (called by fileService)**
  const addFile = useCallback((fileData) => {
    console.log('📄 Adding file to frontend:', fileData.path);
    setFileSystem(prev => {
      const updated = { ...prev };

      // Add the file
      updated[fileData.path] = {
        name: fileData.name,
        type: 'file',
        path: fileData.path,
        extension: fileData.name.split('.').pop()?.toLowerCase() || '',
        content: fileData.content || '',
        created: fileData.created || new Date().toISOString(),
        modified: fileData.modified || new Date().toISOString(),
        size: fileData.size || 0,
        ...fileData
      };

      // Add to parent folder's children
      const parentPath = fileData.path.split('/').slice(0, -1).join('/') || '/';
      if (updated[parentPath] && updated[parentPath].type === 'folder') {
        const children = updated[parentPath].children || [];
        if (!children.includes(fileData.path)) {
          updated[parentPath] = {
            ...updated[parentPath],
            children: [...children, fileData.path],
            modified: new Date().toISOString()
          };
        }
      }

      return updated;
    });
  }, []);

  // Get current directory contents
  const getCurrentDirectoryContents = useCallback((path = currentPath) => {
    console.log('🔍 Getting contents for path:', path);
    console.log('📁 Current file system keys:', Object.keys(fileSystem));
    
    // Get the directory for the current path
    const directory = fileSystem[path];
    if (!directory) {
      console.log('❌ Directory not found:', path);
      return [];
    }
    
    if (directory.type !== 'folder') {
      console.log('❌ Path is not a folder:', path);
      return [];
    }

    // Get children of this directory
    const children = (directory.children || []).map(childPath => fileSystem[childPath]).filter(Boolean);
    console.log('📂 Children found for', path, ':', children.map(item => item.name));
    return children;
  }, [fileSystem, currentPath]);

  // Get item information
  const getItemInfo = useCallback((path) => {
    return fileSystem[path];
  }, [fileSystem]);

  // **NEW: Check if a path exists**
  const pathExists = useCallback((path) => {
    return !!fileSystem[path];
  }, [fileSystem]);

  // **ENHANCED: Create a new folder with backend sync**
  const createFolder = useCallback(async (name, parentPath = currentPath) => {
    const folderPath = `${parentPath}/${name}`.replace('//', '/');

    // Check if folder already exists
    if (fileSystem[folderPath]) {
      throw new Error('Folder already exists');
    }

    const newFolder = {
      name,
      type: 'folder',
      path: folderPath,
      children: [],
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
      size: 0
    };

    // **First update local state**
    setFileSystem(prev => {
      const updated = { ...prev };
      updated[folderPath] = newFolder;

      // Add to parent's children
      if (updated[parentPath]) {
        updated[parentPath] = {
          ...updated[parentPath],
          children: [...(updated[parentPath].children || []), folderPath],
          modified: new Date().toISOString()
        };
      }

      return updated;
    });

    // **Then persist to backend**
    if (isAuthenticated()) {
      try {
        await apiCall('/filesystem/folder', {
          method: 'POST',
          body: JSON.stringify({
            name: name,
            parentPath: parentPath
          })
        });
        console.log('✅ Folder created in backend:', folderPath);
      } catch (error) {
        console.error('❌ Failed to create folder in backend:', error);
        // Could rollback local changes here
      }
    }

    return folderPath;
  }, [fileSystem, currentPath, isAuthenticated, apiCall]);

  // **ENHANCED: Create a new file with backend sync**
  const createFile = useCallback(async (name, content = '', parentPath = currentPath) => {
    const filePath = `${parentPath}/${name}`.replace('//', '/');

    // Check if file already exists
    if (fileSystem[filePath]) {
      throw new Error('File already exists');
    }

    const extension = name.split('.').pop()?.toLowerCase() || '';
    const newFile = {
      name,
      type: 'file',
      path: filePath,
      extension,
      content,
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
      size: content.length
    };

    // **First update local state**
    setFileSystem(prev => {
      const updated = { ...prev };
      updated[filePath] = newFile;

      // Add to parent's children
      if (updated[parentPath]) {
        updated[parentPath] = {
          ...updated[parentPath],
          children: [...(updated[parentPath].children || []), filePath],
          modified: new Date().toISOString()
        };
      }

      return updated;
    });

    // **Then persist to backend**
    if (isAuthenticated()) {
      try {
        await apiCall('/filesystem/file', {
          method: 'POST',
          body: JSON.stringify({
            name: name,
            content: content,
            parentPath: parentPath
          })
        });
        console.log('✅ File created in backend:', filePath);
      } catch (error) {
        console.error('❌ Failed to create file in backend:', error);
        // Could rollback local changes here
      }
    }

    return filePath;
  }, [fileSystem, currentPath, isAuthenticated, apiCall]);

  // **ENHANCED: Save file content with backend sync**
  const saveFile = useCallback(async (fileName, content, dirPath = currentPath) => {
    const filePath = `${dirPath}/${fileName}`.replace('//', '/');

    // Check if this is updating an existing file or creating a new one
    const existingFile = fileSystem[filePath];

    if (existingFile) {
      // **Update existing file in local state**
      const updatedFile = {
        ...existingFile,
        content,
        modified: new Date().toISOString(),
        size: content.length
      };

      setFileSystem(prev => ({
        ...prev,
        [filePath]: updatedFile
      }));

      // **Persist to backend**
      if (isAuthenticated()) {
        try {
          await apiCall('/filesystem/file/save', {
            method: 'POST',
            body: JSON.stringify({
              filePath: filePath,
              content: content
            })
          });
          console.log('✅ File updated in backend:', filePath);
        } catch (error) {
          console.error('❌ Failed to update file in backend:', error);
        }
      }

      return { path: filePath, updated: true };
    } else {
      // Create new file
      const newPath = await createFile(fileName, content, dirPath);
      return { path: newPath, created: true };
    }
  }, [fileSystem, currentPath, createFile, isAuthenticated, apiCall]);

  // **ENHANCED: Delete items with backend sync**
  const deleteItems = useCallback(async (paths) => {
    // **First update local state**
    setFileSystem(prev => {
      const updated = { ...prev };

      paths.forEach(path => {
        const item = updated[path];
        if (!item) return;

        // Remove from parent's children
        const parentPath = path.split('/').slice(0, -1).join('/') || '/';
        if (updated[parentPath]) {
          updated[parentPath] = {
            ...updated[parentPath],
            children: updated[parentPath].children.filter(child => child !== path),
            modified: new Date().toISOString()
          };
        }

        // If it's a folder, recursively delete children
        if (item.type === 'folder' && item.children) {
          item.children.forEach(childPath => {
            delete updated[childPath];
          });
        }

        // Delete the item itself
        delete updated[path];
      });

      return updated;
    });

    // **Then persist to backend**
    if (isAuthenticated()) {
      try {
        for (const path of paths) {
          await apiCall('/filesystem/item/delete', {
            method: 'POST',
            body: JSON.stringify({
              itemPath: path
            })
          });
        }
        console.log('✅ Items deleted from backend:', paths);
      } catch (error) {
        console.error('❌ Failed to delete items from backend:', error);
      }
    }
  }, [isAuthenticated, apiCall]);

  // **ENHANCED: Rename item with backend sync**
  const renameItem = useCallback(async (oldPath, newName) => {
    const item = fileSystem[oldPath];
    if (!item) {
      throw new Error('Item not found');
    }

    const pathParts = oldPath.split('/');
    pathParts[pathParts.length - 1] = newName;
    const newPath = pathParts.join('/');

    if (fileSystem[newPath]) {
      throw new Error('An item with this name already exists');
    }

    // **First update local state**
    setFileSystem(prev => {
      const updated = { ...prev };

      // Update the item
      updated[newPath] = {
        ...item,
        name: newName,
        path: newPath,
        modified: new Date().toISOString()
      };

      // Update extension for files
      if (item.type === 'file') {
        updated[newPath].extension = newName.split('.').pop()?.toLowerCase() || '';
      }

      // Remove old entry
      delete updated[oldPath];

      // Update parent's children
      const parentPath = oldPath.split('/').slice(0, -1).join('/') || '/';
      if (updated[parentPath]) {
        updated[parentPath] = {
          ...updated[parentPath],
          children: updated[parentPath].children.map(child =>
            child === oldPath ? newPath : child
          ),
          modified: new Date().toISOString()
        };
      }

      // If it's a folder, update all children paths
      if (item.type === 'folder' && item.children) {
        const updateChildrenPaths = (children, oldBasePath, newBasePath) => {
          children.forEach(childPath => {
            const newChildPath = childPath.replace(oldBasePath, newBasePath);
            if (updated[childPath]) {
              updated[newChildPath] = {
                ...updated[childPath],
                path: newChildPath
              };
              delete updated[childPath];

              // Recursively update if it's a folder
              if (updated[newChildPath].type === 'folder' && updated[newChildPath].children) {
                updateChildrenPaths(updated[newChildPath].children, childPath, newChildPath);
                updated[newChildPath].children = updated[newChildPath].children.map(cp =>
                  cp.replace(oldBasePath, newBasePath)
                );
              }
            }
          });
        };

        updateChildrenPaths(item.children, oldPath, newPath);
        updated[newPath].children = item.children.map(child =>
          child.replace(oldPath, newPath)
        );
      }

      return updated;
    });

    // **Then persist to backend**
    if (isAuthenticated()) {
      try {
        await apiCall('/filesystem/item/rename', {
          method: 'POST',
          body: JSON.stringify({
            itemPath: oldPath,
            newName: newName
          })
        });
        console.log('✅ Item renamed in backend:', oldPath, '→', newPath);
      } catch (error) {
        console.error('❌ Failed to rename item in backend:', error);
      }
    }

    return newPath;
  }, [fileSystem, isAuthenticated, apiCall]);

  // Search files
  const searchFiles = useCallback((query, searchPath = '/') => {
    const results = [];
    const search = (path) => {
      const item = fileSystem[path];
      if (!item) return;

      if (item.name.toLowerCase().includes(query.toLowerCase()) ||
        (item.content && item.content.toLowerCase().includes(query.toLowerCase()))) {
        results.push(item);
      }

      if (item.type === 'folder' && item.children) {
        item.children.forEach(search);
      }
    };

    search(searchPath);
    return results;
  }, [fileSystem]);

  const contextValue = {
    fileSystem,
    currentPath,
    setCurrentPath,
    loading,
    error,
    getCurrentDirectoryContents,
    getItemInfo,
    pathExists,
    createFolder,
    createFile,
    saveFile,
    deleteItems,
    renameItem,
    searchFiles,
    loadFromBackend,
    refreshFileSystem,    // **NEW: For fileService to call**
    updateFileContent,    // **NEW: For fileService to call**
    addFile,             // **NEW: For fileService to call**
    initializeFileSystem,
    initializeFileSystemManually  // **NEW: For manual initialization**
  };

  return (
    <FileSystemContext.Provider value={contextValue}>
      {children}
    </FileSystemContext.Provider>
  );
};