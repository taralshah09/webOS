import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const FileSystemContext = createContext();

export const useFileSystem = () => useContext(FileSystemContext);

export const FileSystemProvider = ({ children }) => {
  // File system state: flat object map, path -> file/folder object
  const [fileSystem, setFileSystem] = useState({});
  const [currentPath, setCurrentPath] = useState('/');

  // Create default file system structure
  const createDefaultFileSystem = useCallback(() => {
    const now = new Date().toISOString();
    const defaultFS = {
      '/': {
        type: 'folder',
        name: 'Root',
        children: ['/Desktop'],
        created: now,
        modified: now,
        size: 0
      },
      '/Desktop': {
        type: 'folder',
        name: 'Desktop',
        children: ['/Desktop/readme.txt'],
        created: now,
        modified: now,
        size: 0
      },
      '/Desktop/readme.txt': {
        type: 'file',
        name: 'readme.txt',
        extension: 'txt',
        size: 1024,
        created: now,
        modified: now,
        content: 'Welcome to Web OS!\n\nThis is your desktop folder.'
      }
    };
    setFileSystem(defaultFS);
    setCurrentPath('/');
  }, []);

  // Load from localStorage or create default
  useEffect(() => {
    const stored = localStorage.getItem('webos_filesystem');
    if (stored) {
      try {
        setFileSystem(JSON.parse(stored));
      } catch {
        createDefaultFileSystem();
      }
    } else {
      createDefaultFileSystem();
    }
  }, [createDefaultFileSystem]);

  // Persist to localStorage
  useEffect(() => {
    if (Object.keys(fileSystem).length > 0) {
      localStorage.setItem('webos_filesystem', JSON.stringify(fileSystem));
    }
  }, [fileSystem]);

  // File/folder operations
  const getCurrentDirectoryContents = useCallback((path = currentPath) => {
    const dir = fileSystem[path];
    if (!dir || dir.type !== 'folder') return [];
    return dir.children
      .map(childPath => ({ path: childPath, ...fileSystem[childPath] }))
      .filter(item => item.name);
  }, [fileSystem, currentPath]);

  const navigateTo = (path) => setCurrentPath(path);

  const navigateUp = () => {
    if (currentPath === '/') return;
    const parentPath = currentPath.split('/').slice(0, -1).join('/') || '/';
    setCurrentPath(parentPath);
  };

  const createFolder = (name) => {
    const newPath = `${currentPath}${currentPath.endsWith('/') ? '' : '/'}${name}`;
    if (fileSystem[newPath]) throw new Error('A folder with this name already exists');
    const now = new Date().toISOString();
    const newFolder = {
      type: 'folder',
      name,
      children: [],
      created: now,
      modified: now,
      size: 0
    };
    setFileSystem(prev => {
      const updated = { ...prev };
      updated[newPath] = newFolder;
      if (!updated[currentPath].children.includes(newPath)) {
        updated[currentPath].children.push(newPath);
      }
      updated[currentPath].modified = now;
      return updated;
    });
  };

  const createFile = (name, content = '') => {
    const extension = name.includes('.') ? name.split('.').pop() : '';
    const newPath = `${currentPath}${currentPath.endsWith('/') ? '' : '/'}${name}`;
    if (fileSystem[newPath]) throw new Error('A file with this name already exists');
    const now = new Date().toISOString();
    const newFile = {
      type: 'file',
      name,
      extension,
      size: content.length,
      content,
      created: now,
      modified: now
    };
    setFileSystem(prev => {
      const updated = { ...prev };
      updated[newPath] = newFile;
      if (!updated[currentPath].children.includes(newPath)) {
        updated[currentPath].children.push(newPath);
      }
      updated[currentPath].modified = now;
      return updated;
    });
  };

  const deleteItems = (paths) => {
    const pathsToDelete = Array.isArray(paths) ? paths : [paths];
    setFileSystem(prev => {
      const updated = { ...prev };
      pathsToDelete.forEach(path => {
        const parentPath = path.split('/').slice(0, -1).join('/') || '/';
        if (updated[parentPath]) {
          updated[parentPath].children = updated[parentPath].children.filter(child => child !== path);
          updated[parentPath].modified = new Date().toISOString();
        }
        delete updated[path];
      });
      return updated;
    });
  };

  const renameItem = (oldPath, newName) => {
    const parentPath = oldPath.split('/').slice(0, -1).join('/') || '/';
    const newPath = `${parentPath}${parentPath.endsWith('/') ? '' : '/'}${newName}`;
    if (fileSystem[newPath]) throw new Error('An item with this name already exists');
    setFileSystem(prev => {
      const updated = { ...prev };
      const item = updated[oldPath];
      item.name = newName;
      item.modified = new Date().toISOString();
      if (item.type === 'file' && item.name.includes('.')) {
        item.extension = item.name.split('.').pop();
      }
      updated[newPath] = item;
      delete updated[oldPath];
      updated[parentPath].children = updated[parentPath].children.map(child => child === oldPath ? newPath : child);
      updated[parentPath].modified = new Date().toISOString();
      return updated;
    });
  };

  return (
    <FileSystemContext.Provider
      value={{
        fileSystem,
        setFileSystem,
        currentPath,
        setCurrentPath,
        getCurrentDirectoryContents,
        navigateTo,
        navigateUp,
        createFolder,
        createFile,
        deleteItems,
        renameItem
      }}
    >
      {children}
    </FileSystemContext.Provider>
  );
}; 