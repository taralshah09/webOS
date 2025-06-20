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
    saveFile,
    deleteItems,
    renameItem,
    getItemInfo,
    searchFiles
  } = useFileSystem();

  const [selectedItems, setSelectedItems] = useState([]);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, target: null });
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('name'); // 'name', 'type', 'size', 'date'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Listen for file service events
  useEffect(() => {
    const unsubscribe = fileService.addListener((event) => {
      switch (event.type) {
        case 'OPEN_FILE':
          console.log('File opened via service:', event.filePath);
          break;
        case 'SAVE_FILE_SUCCESS':
          console.log('File saved successfully:', event.filePath);
          // Could refresh the file explorer view here
          break;
        case 'SAVE_FILE_ERROR':
          console.error('File save error:', event.error);
          break;
        case 'FILE_CREATED':
          console.log('New file created:', event.filePath);
          break;
      }
    });

    return unsubscribe;
  }, []);

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim()) {
      setIsSearching(true);
      const debounceSearch = setTimeout(() => {
        const results = searchFiles(searchQuery);
        setSearchResults(results);
        setIsSearching(false);
      }, 300);

      return () => clearTimeout(debounceSearch);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  }, [searchQuery, searchFiles]);

  // Get current directory contents with sorting
  const getCurrentDirectoryContentsSorted = useCallback(() => {
    const contents = searchQuery ? searchResults : getCurrentDirectoryContents(currentPath);
    
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
          comparison = (a.size || 0) - (b.size || 0);
          break;
        case 'date':
          comparison = new Date(a.modified) - new Date(b.modified);
          break;
        default:
          comparison = a.name.localeCompare(b.name);
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [getCurrentDirectoryContents, currentPath, sortBy, sortOrder, searchQuery, searchResults]);

  // Navigation functions
  const navigateTo = (path) => {
    setCurrentPath(path);
    setSelectedItems([]);
    setSearchQuery(''); // Clear search when navigating
  };

  const navigateUp = () => {
    if (currentPath === '/') return;
    const parentPath = currentPath.split('/').slice(0, -1).join('/') || '/';
    navigateTo(parentPath);
  };

  // Enhanced file operations
  const handleCreateFolder = useCallback(async (name) => {
    try {
      const newPath = createFolder(name, currentPath);
      console.log(`✅ Folder created: ${name} in ${currentPath}`);
      return newPath;
    } catch (error) {
      console.error('❌ Error creating folder:', error);
      throw error;
    }
  }, [createFolder, currentPath]);

  const handleCreateFile = useCallback(async (name, content = '') => {
    try {
      const newPath = createFile(name, content, currentPath);
      console.log(`✅ File created: ${name} in ${currentPath}`);
      
      // If it's a text-editable file, offer to open it
      if (fileService.isFileEditable(newPath)) {
        const openFile = window.confirm(`File created successfully! Would you like to open "${name}" in the text editor?`);
        if (openFile) {
          fileService.openFile(newPath, content, name.split('.').pop()?.toLowerCase() || 'text');
        }
      }
      
      return newPath;
    } catch (error) {
      console.error('❌ Error creating file:', error);
      throw error;
    }
  }, [createFile, currentPath]);

  const handleDeleteItems = useCallback(async (paths) => {
    try {
      deleteItems(paths);
      setSelectedItems([]); // Clear selection after deletion
      console.log(`✅ Items deleted:`, paths);
    } catch (error) {
      console.error('❌ Error deleting items:', error);
      throw error;
    }
  }, [deleteItems]);

  const handleRenameItem = useCallback(async (oldPath, newName) => {
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

  // Enhanced file double-click with better file type detection
  const handleFileDoubleClick = useCallback((item) => {
    if (item.type === 'folder') {
      navigateTo(item.path);
    } else {
      // Get file content and open with appropriate application
      const fileInfo = getItemInfo(item.path);
      const fileContent = fileInfo?.content || '';
      
      // Check if it's an editable file type
      if (fileService.isFileEditable(item.path)) {
        fileService.openFile(item.path, fileContent, item.extension || 'text');
        console.log(`📝 Opening editable file: ${item.path}`);
      } else {
        // For non-editable files, could open with different applications
        console.log(`📂 Opening file: ${item.path} (type: ${item.extension})`);
        // Could show a preview or download the file
        alert(`File type ".${item.extension}" is not directly editable. File opened in preview mode.`);
      }
    }
  }, [navigateTo, getItemInfo]);

  // Handle edit file action from context menu
  const handleEditFile = useCallback((filePath) => {
    const fileInfo = getItemInfo(filePath);
    if (fileInfo && fileService.isFileEditable(filePath)) {
      fileService.openFile(filePath, fileInfo.content || '', fileInfo.extension || 'text');
    } else {
      alert('This file type cannot be edited in the text editor.');
    }
  }, [getItemInfo]);

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
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        isSearching={isSearching}
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
          {searchQuery && (
            <div className="search-header">
              <h3>Search Results for "{searchQuery}"</h3>
              <span className="search-count">
                {isSearching ? 'Searching...' : `${currentContents.length} items found`}
              </span>
            </div>
          )}
          
          <FileGrid
            items={currentContents}
            currentPath={currentPath}
            selectedItems={selectedItems}
            onSelectItems={setSelectedItems}
            onNavigate={navigateTo}
            onContextMenu={handleContextMenu}
            viewMode={viewMode}
            onDoubleClick={handleFileDoubleClick}
            onEditFile={handleEditFile}
            searchQuery={searchQuery}
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
          onEdit={handleEditFile}
          onClose={() => setContextMenu({ visible: false, x: 0, y: 0, target: null })}
          fileService={fileService}
        />
      )}
    </div>
  );
};

export default FileExplorer;