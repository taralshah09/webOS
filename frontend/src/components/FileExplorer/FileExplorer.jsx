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
    getItemInfo,
    searchFiles,
    refreshFileSystem, // Add this if you don't have it
    initializeFileSystemManually
  } = useFileSystem();

  const [selectedItems, setSelectedItems] = useState([]);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, target: null });
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('name'); // 'name', 'type', 'size', 'date'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // **NEW: Loading states for operations**
  const [isLoading, setIsLoading] = useState(false);
  const [operationStatus, setOperationStatus] = useState('');

  // **ENHANCED: Listen for file service events with backend sync**
  useEffect(() => {
    const unsubscribe = fileService.addListener((event) => {
      switch (event.type) {
        case 'OPEN_FILE':
          console.log('File opened via service:', event.filePath);
          break;
          
        case 'SAVE_FILE_SUCCESS':
          // console.log('File saved successfully:', event.filePath);
          setOperationStatus(`✅ File saved: ${typeof event.filePath === 'string' ? event.filePath.split('/').pop() : 'Unknown file'}`);
          setTimeout(() => setOperationStatus(''), 3000);
          
          // **NEW: Refresh file system context after backend save**
          if (typeof refreshFileSystem === 'function') {
            refreshFileSystem();
          }
          break;
          
        case 'SAVE_FILE_ERROR':
          // console.error('File save error:', event.error);
          setOperationStatus(`❌ Save failed: ${event.error}`);
          setTimeout(() => setOperationStatus(''), 5000);
          break;
          
        case 'FILE_CREATED':
          // console.log('New file created:', event.filePath);
          setOperationStatus(`✅ File created: ${typeof event.filePath === 'string' ? event.filePath.split('/').pop() : 'Unknown file'}`);
          setTimeout(() => setOperationStatus(''), 3000);
          
          // **NEW: Refresh file system after backend file creation**
          if (typeof refreshFileSystem === 'function') {
            refreshFileSystem();
          }
          break;
          
        case 'FILE_CREATE_ERROR':
          // console.error('File creation error:', event.error);
          setOperationStatus(`❌ Create failed: ${event.error}`);
          setTimeout(() => setOperationStatus(''), 5000);
          break;

        // **NEW: Handle additional backend events**
        case 'FILE_DELETED':
          // setOperationStatus(`✅ File deleted: ${typeof event.filePath === 'string' ? event.filePath.split('/').pop() : 'Unknown file'}`);
          setTimeout(() => setOperationStatus(''), 3000);
          if (typeof refreshFileSystem === 'function') {
            refreshFileSystem();
          }
          break;

        case 'FILE_RENAMED':
          // setOperationStatus(`✅ File renamed to: ${typeof event.newPath === 'string' ? event.newPath.split('/').pop() : 'Unknown file'}`);
          setTimeout(() => setOperationStatus(''), 3000);
          if (typeof refreshFileSystem === 'function') {
            refreshFileSystem();
          }
          break;

        case 'LOAD_FILE_START':
          setIsLoading(true);
          setOperationStatus('📂 Loading file...');
          break;

        case 'LOAD_FILE_SUCCESS':
          setIsLoading(false);
          setOperationStatus('✅ File loaded');
          setTimeout(() => setOperationStatus(''), 2000);
          break;

        case 'LOAD_FILE_ERROR':
          setIsLoading(false);
          setOperationStatus(`❌ Load failed: ${event.error}`);
          setTimeout(() => setOperationStatus(''), 5000);
          break;
      }
    });

    return unsubscribe;
  }, [refreshFileSystem]);

  // **ENHANCED: Search functionality with backend support**
  useEffect(() => {
    if (searchQuery.trim()) {
      setIsSearching(true);
      const debounceSearch = setTimeout(async () => {
        try {
          // **NEW: Try backend search first, fallback to local**
          let results;
          try {
            const backendResults = await fileService.searchFiles(searchQuery);
            results = backendResults.results || [];
          } catch (backendError) {
            console.warn('Backend search failed, using local search:', backendError);
            results = searchFiles(searchQuery);
          }
          
          setSearchResults(results);
        } catch (error) {
          console.error('Search error:', error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
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

  // **ENHANCED: File operations with backend integration**
  const handleCreateFolder = useCallback(async (name) => {
    try {
      setIsLoading(true);
      setOperationStatus('📁 Creating folder...');
      
      // **NEW: Create folder via backend first**
      try {
        await fileService.apiCall('/filesystem/folder', {
          method: 'POST',
          body: JSON.stringify({
            name: name,
            parentPath: currentPath
          })
        });
        
        // Then update local context
        const newPath = createFolder(name, currentPath);
        // console.log(`✅ Folder created: ${name} in ${currentPath}`);
        return newPath;
        
      } catch (backendError) {
        // console.warn('Backend folder creation failed, trying local:', backendError);
        // Fallback to local creation
        return createFolder(name, currentPath);
      }
      
    } catch (error) {
      console.error('❌ Error creating folder:', error);
      setOperationStatus(`❌ Failed to create folder: ${error.message}`);
      setTimeout(() => setOperationStatus(''), 5000);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [createFolder, currentPath]);

  const handleCreateFile = useCallback(async (name, content = '') => {
    try {
      setIsLoading(true);
      setOperationStatus('📄 Creating file...');
      
      // **NEW: Create file via backend**
      let newPath;
      try {
        const result = await fileService.createFile(name, content, currentPath);
        newPath = result.path;
        // console.log(`✅ File created via backend: ${name} in ${currentPath}`);
      } catch (backendError) {
        console.warn('Backend file creation failed, trying local:', backendError);
        // Fallback to local creation
        newPath = createFile(name, content, currentPath);
      }
      
      // If it's a text-editable file, offer to open it
      if (fileService.isFileEditable(newPath)) {
        const openFile = window.confirm(`File created successfully! Would you like to open "${name}" in the text editor?`);
        if (openFile) {
          fileService.openFile(newPath, content);
        }
      }
      
      return newPath;
      
    } catch (error) {
      console.error('❌ Error creating file:', error);
      setOperationStatus(`❌ Failed to create file: ${error.message}`);
      setTimeout(() => setOperationStatus(''), 5000);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [createFile, currentPath]);

  const handleDeleteItems = useCallback(async (paths) => {
    try {
      setIsLoading(true);
      setOperationStatus('🗑️ Deleting items...');
      
      // **NEW: Delete via backend API**
      for (const path of paths) {
        try {
          await fileService.deleteFile(path);
        } catch (backendError) {
          console.warn(`Backend deletion failed for ${path}, trying local:`, backendError);
        }
      }
      
      // Update local context
      deleteItems(paths);
      setSelectedItems([]); // Clear selection after deletion
      // console.log(`✅ Items deleted:`, paths);
      
    } catch (error) {
      console.error('❌ Error deleting items:', error);
      setOperationStatus(`❌ Failed to delete items: ${error.message}`);
      setTimeout(() => setOperationStatus(''), 5000);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [deleteItems]);

  const handleRenameItem = useCallback(async (oldPath, newName) => {
    try {
      setIsLoading(true);
      setOperationStatus('✏️ Renaming item...');
      
      // **NEW: Rename via backend API**
      let newPath;
      try {
        const result = await fileService.renameFile(oldPath, newName);
        newPath = result.path;
      } catch (backendError) {
        console.warn('Backend rename failed, trying local:', backendError);
        // Fallback to local rename
        newPath = renameItem(oldPath, newName);
      }
      
      // Update selection if the renamed item was selected
      setSelectedItems(prev => 
        prev.map(path => path === oldPath ? newPath : path)
      );
      
      // console.log(`✅ Item renamed: ${oldPath} → ${newPath}`);
      return newPath;
      
    } catch (error) {
      console.error('❌ Error renaming item:', error);
      setOperationStatus(`❌ Failed to rename item: ${error.message}`);
      setTimeout(() => setOperationStatus(''), 5000);
      throw error;
    } finally {
      setIsLoading(false);
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

  // **ENHANCED: File double-click with backend loading**
  const handleFileDoubleClick = useCallback(async (item) => {
    if (item.type === 'folder') {
      navigateTo(item.path);
    } else {
      try {
        setIsLoading(true);
        
        // **NEW: Load file content from backend if needed**
        let fileContent = '';
        if (fileService.isFileEditable(item.path)) {
          try {
            const fileData = await fileService.loadFile(item.path);
            fileContent = fileData.content || '';
          } catch (loadError) {
            console.warn('Failed to load from backend, trying local:', loadError);
            const fileInfo = getItemInfo(item.path);
            fileContent = fileInfo?.content || '';
          }
          
          fileService.openFile(item.path, fileContent);
          // console.log(`📝 Opening editable file: ${item.path}`);
        } else {
          // For non-editable files, could open with different applications
          // console.log(`📂 Opening file: ${item.path} (type: ${item.extension})`);
          alert(`File type ".${item.extension}" is not directly editable. File opened in preview mode.`);
        }
        
      } catch (error) {
        console.error('Error opening file:', error);
        setOperationStatus(`❌ Failed to open file: ${error.message}`);
        setTimeout(() => setOperationStatus(''), 5000);
      } finally {
        setIsLoading(false);
      }
    }
  }, [navigateTo, getItemInfo]);

  // **ENHANCED: Handle edit file action with backend loading**
  const handleEditFile = useCallback(async (filePath) => {
    try {
      setIsLoading(true);
      
      // **NEW: Validate filePath is a string**
      if (typeof filePath !== 'string') {
        throw new Error('Invalid file path provided');
      }
      
      if (fileService.isFileEditable(filePath)) {
        // **NEW: Load file content from backend**
        let fileContent = '';
        try {
          const fileData = await fileService.loadFile(filePath);
          fileContent = fileData.content || '';
        } catch (loadError) {
          console.warn('Failed to load from backend, trying local:', loadError);
          const fileInfo = getItemInfo(filePath);
          fileContent = fileInfo?.content || '';
        }
        
        fileService.openFile(filePath, fileContent);
      } else {
        alert('This file type cannot be edited in the text editor.');
      }
      
    } catch (error) {
      console.error('Error editing file:', error);
      setOperationStatus(`❌ Failed to open file for editing: ${error.message}`);
      setTimeout(() => setOperationStatus(''), 5000);
    } finally {
      setIsLoading(false);
    }
  }, [getItemInfo]);

  const currentContents = getCurrentDirectoryContentsSorted();

  // console.log('📂 FileExplorer - Current contents:', {
  //   currentPath,
  //   totalItems: currentContents.length,
  //   items: currentContents.map(item => ({ name: item.name, type: item.type, path: item.path })),
  //   fileSystemKeys: Object.keys(fileSystem),
  //   fileSystemSize: Object.keys(fileSystem).length
  // });

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
        // **NEW: Pass loading state and operation status**
        isLoading={isLoading}
        operationStatus={operationStatus}
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
          {/* **NEW: Operation status indicator** */}
          {operationStatus && (
            <div className="operation-status">
              <span className="status-message">{operationStatus}</span>
            </div>
          )}
          
          {/* **NEW: Empty file system message with initialization button** */}
          {Object.keys(fileSystem).length === 0 && !isLoading && (
            <div className="empty-file-system">
              <div className="empty-message">
                <h3>📁 No files found</h3>
                <p>Your file system appears to be empty. This might be because:</p>
                <ul>
                  <li>You're a new user and the default files haven't been created yet</li>
                  <li>There was an issue loading your files from the server</li>
                </ul>
                <button 
                  className="initialize-button"
                  onClick={initializeFileSystemManually}
                  disabled={isLoading}
                >
                  {isLoading ? '🔄 Initializing...' : '📁 Initialize File System'}
                </button>
              </div>
            </div>
          )}
          
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
            // **NEW: Pass loading state**
            isLoading={isLoading}
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
          // **NEW: Pass loading state**
          isLoading={isLoading}
        />
      )}
      
      {/* **NEW: Loading overlay** */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <span>Processing...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileExplorer;