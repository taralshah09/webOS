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
  const { token } = useAuth();
  const [fileSystem, setFileSystem] = useState({});
  const [currentPath, setCurrentPath] = useState('/');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize file system with default structure
  useEffect(() => {
    initializeFileSystem();
  }, []);

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

  // Get current directory contents
  const getCurrentDirectoryContents = useCallback((path = currentPath) => {
    const directory = fileSystem[path];
    if (!directory || directory.type !== 'folder') {
      return [];
    }

    return (directory.children || []).map(childPath => fileSystem[childPath]).filter(Boolean);
  }, [fileSystem, currentPath]);

  // Get item information
  const getItemInfo = useCallback((path) => {
    return fileSystem[path];
  }, [fileSystem]);

  // Create a new folder
  const createFolder = useCallback((name, parentPath = currentPath) => {
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

    // TODO: Persist to backend
    persistToBackend('createFolder', { path: folderPath, data: newFolder });
    
    return folderPath;
  }, [fileSystem, currentPath]);

  // Create a new file
  const createFile = useCallback((name, content = '', parentPath = currentPath) => {
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

    // TODO: Persist to backend
    persistToBackend('createFile', { path: filePath, data: newFile });
    
    return filePath;
  }, [fileSystem, currentPath]);

  // Save file content (for existing files)
  const saveFile = useCallback(async (fileName, content, dirPath = currentPath) => {
    const filePath = `${dirPath}/${fileName}`.replace('//', '/');
    
    // Check if this is updating an existing file or creating a new one
    const existingFile = fileSystem[filePath];
    
    if (existingFile) {
      // Update existing file
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

      // TODO: Persist to backend
      await persistToBackend('updateFile', { path: filePath, data: updatedFile });
      
      return { path: filePath, updated: true };
    } else {
      // Create new file
      return { path: createFile(fileName, content, dirPath), created: true };
    }
  }, [fileSystem, currentPath, createFile]);

  // Delete items
  const deleteItems = useCallback((paths) => {
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
          deleteItems(item.children);
        }
        
        // Delete the item itself
        delete updated[path];
      });
      
      return updated;
    });

    // TODO: Persist to backend
    persistToBackend('deleteItems', { paths });
  }, []);

  // Rename item
  const renameItem = useCallback((oldPath, newName) => {
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

    // TODO: Persist to backend
    persistToBackend('renameItem', { oldPath, newPath, newName });
    
    return newPath;
  }, [fileSystem]);

  // Persist changes to backend (placeholder)
  const persistToBackend = useCallback(async (operation, data) => {
    if (!token) return;
    
    try {
      // This would make actual API calls to save to database
      console.log(`Backend operation: ${operation}`, data);
      
      // Example API call structure:
      // const response = await fetch('/api/filesystem', {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${token}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({ operation, data })
      // });
      
      // if (!response.ok) {
      //   throw new Error('Failed to persist to backend');
      // }
      
    } catch (error) {
      console.error('Backend persistence error:', error);
      // Could implement retry logic or show user notification
    }
  }, [token]);

  // Load file system from backend (placeholder)
  const loadFromBackend = useCallback(async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // This would load from actual backend
      // const response = await fetch('/api/filesystem', {
      //   headers: {
      //     'Authorization': `Bearer ${token}`
      //   }
      // });
      
      // if (response.ok) {
      //   const data = await response.json();
      //   setFileSystem(data.fileSystem || {});
      // }
      
    } catch (error) {
      console.error('Error loading from backend:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

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
    createFolder,
    createFile,
    saveFile,
    deleteItems,
    renameItem,
    searchFiles,
    loadFromBackend,
    initializeFileSystem
  };

  return (
    <FileSystemContext.Provider value={contextValue}>
      {children}
    </FileSystemContext.Provider>
  );
};