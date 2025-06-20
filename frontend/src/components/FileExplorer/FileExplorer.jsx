import React, { useState, useEffect, useCallback } from 'react';
import { useFileSystem } from '../../contexts/FileSystemContext';
import fileService from '../../services/fileService';
import FileTree from './FileTree';
import FileGrid from './FileGrid';
import FileToolbar from './FileToolbar';
import FileContextMenu from './FileContextMenu';
import './FileExplorer.css';

const FileExplorer = () => {
  const {
    fileSystem,
    currentPath,
    setCurrentPath,
    getCurrentDirectoryContents,
    createFolder,
    createFile,
    deleteItems,
    renameItem,
    getItemInfo
  } = useFileSystem();

  const [selectedItems, setSelectedItems] = useState([]);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, target: null });
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('name'); // 'name', 'type', 'size', 'date'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'

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
    // File opening is handled by the fileService
    console.log('File opened via service:', filePath);
  };

  // Get current directory contents with sorting
  const getCurrentDirectoryContentsSorted = useCallback(() => {
    const contents = getCurrentDirectoryContents(currentPath);
    
    return contents.sort((a, b) => {
      // Sort folders first, then files
      if (a.type !== b.type) {
        return a.type === 'folder' ? -1 : 1;
      }

      // Then sort by the selected criteria
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'type':
          comparison = (a.extension || '').localeCompare(b.extension || '');
          break;
        case 'size':
          comparison = a.size - b.size;
          break;
        case 'date':
          comparison = new Date(a.modified) - new Date(b.modified);
          break;
        default:
          comparison = a.name.localeCompare(b.name);
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [getCurrentDirectoryContents, currentPath, sortBy, sortOrder]);

  // Navigation functions
  const navigateTo = (path) => {
    setCurrentPath(path);
    setSelectedItems([]);
  };

  const navigateUp = () => {
    if (currentPath === '/') return;
    const parentPath = currentPath.split('/').slice(0, -1).join('/') || '/';
    navigateTo(parentPath);
  };

  // File operations with better error handling
  const handleCreateFolder = useCallback((name) => {
    try {
      createFolder(name, currentPath);
      console.log(`✅ Folder created: ${name} in ${currentPath}`);
    } catch (error) {
      console.error('❌ Error creating folder:', error);
      throw error;
    }
  }, [createFolder, currentPath]);

  const handleCreateFile = useCallback((name, content = '') => {
    try {
      createFile(name, content, currentPath);
      console.log(`✅ File created: ${name} in ${currentPath}`);
    } catch (error) {
      console.error('❌ Error creating file:', error);
      throw error;
    }
  }, [createFile, currentPath]);

  const handleDeleteItems = useCallback((paths) => {
    try {
      deleteItems(paths);
      setSelectedItems([]); // Clear selection after deletion
      console.log(`✅ Items deleted:`, paths);
    } catch (error) {
      console.error('❌ Error deleting items:', error);
      throw error;
    }
  }, [deleteItems]);

  const handleRenameItem = useCallback((oldPath, newName) => {
    try {
      const newPath = renameItem(oldPath, newName);
      
      // Update selection if the renamed item was selected
      setSelectedItems(prev => 
        prev.map(path => path === oldPath ? newPath : path)
      );
      
      console.log(`✅ Item renamed: ${oldPath} → ${newPath}`);
      return newPath;
    } catch (error) {
      console.error('❌ Error renaming item:', error);
      throw error;
    }
  }, [renameItem]);

  // Context menu handlers
  const handleContextMenu = (e, target = null) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      target
    });
  };

  const handleClick = () => {
    setContextMenu({ visible: false, x: 0, y: 0, target: null });
  };

  // Global click handler to close context menu
  useEffect(() => {
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // Handle file double-click
  const handleFileDoubleClick = useCallback((item) => {
    if (item.type === 'folder') {
      navigateTo(item.path);
    } else {
      // Open file using the file service
      const fileContent = getItemInfo(item.path)?.content || '';
      fileService.openFile(item.path, fileContent, item.extension);
      console.log(`📂 Opening file: ${item.path}`);
    }
  }, [navigateTo, getItemInfo]);

  const currentContents = getCurrentDirectoryContentsSorted();

  return (
    <div className="file-explorer">
      <FileToolbar
        currentPath={currentPath}
        onNavigateUp={navigateUp}
        onNavigateTo={navigateTo}
        onCreateFolder={handleCreateFolder}
        onCreateFile={handleCreateFile}
        onDelete={() => handleDeleteItems(selectedItems)}
        onRename={handleRenameItem}
        selectedItems={selectedItems}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
      />
      
      <div className="file-explorer-content">
        <div className="file-explorer-sidebar">
          <FileTree
            fileSystem={fileSystem}
            currentPath={currentPath}
            onNavigate={navigateTo}
            onContextMenu={handleContextMenu}
          />
        </div>
        
        <div className="file-explorer-main">
          <FileGrid
            items={currentContents}
            currentPath={currentPath}
            selectedItems={selectedItems}
            onSelectItems={setSelectedItems}
            onNavigate={navigateTo}
            onContextMenu={handleContextMenu}
            viewMode={viewMode}
            onDoubleClick={handleFileDoubleClick}
          />
        </div>
      </div>

      {contextMenu.visible && (
        <FileContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          target={contextMenu.target}
          currentPath={currentPath}
          selectedItems={selectedItems}
          onCreateFolder={handleCreateFolder}
          onCreateFile={handleCreateFile}
          onDelete={handleDeleteItems}
          onRename={handleRenameItem}
          onClose={() => setContextMenu({ visible: false, x: 0, y: 0, target: null })}
        />
      )}
    </div>
  );
};

export default FileExplorer;