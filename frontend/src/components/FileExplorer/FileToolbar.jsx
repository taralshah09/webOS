import React, { useState } from 'react';
import './FileToolbar.css';

const FileToolbar = ({
  currentPath,
  onNavigateUp,
  onNavigateTo,
  onCreateFolder,
  onCreateFile,
  onDelete,
  onRename,
  selectedItems,
  viewMode,
  onViewModeChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange
}) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createType, setCreateType] = useState('folder');
  const [createName, setCreateName] = useState('');

  const handleCreate = () => {
    if (!createName.trim()) return;

    try {
      if (createType === 'folder') {
        onCreateFolder(createName.trim());
      } else {
        onCreateFile(createName.trim());
      }
      setShowCreateDialog(false);
      setCreateName('');
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDelete = () => {
    if (selectedItems.length === 0) return;
    
    const itemText = selectedItems.length === 1 ? 'this item' : 'these items';
    if (confirm(`Are you sure you want to delete ${itemText}?`)) {
      onDelete(selectedItems);
    }
  };

  const handleRename = () => {
    if (selectedItems.length !== 1) return;
    
    const newName = prompt('Enter new name:');
    if (newName && newName.trim()) {
      try {
        onRename(selectedItems[0], newName.trim());
      } catch (error) {
        alert(error.message);
      }
    }
  };

  const getPathBreadcrumbs = () => {
    const parts = currentPath.split('/').filter(Boolean);
    return parts.map((part, index) => {
      const path = '/' + parts.slice(0, index + 1).join('/');
      return { name: part, path };
    });
  };

  return (
    <div className="file-toolbar">
      <div className="toolbar-left">
        {/* Navigation buttons */}
        <button
          className="toolbar-button"
          onClick={onNavigateUp}
          disabled={currentPath === '/'}
          title="Go to parent folder"
        >
          ⬆️ Up
        </button>
        
        <button
          className="toolbar-button"
          onClick={() => onNavigateTo('/')}
          title="Go to root"
        >
          🏠 Home
        </button>
      </div>

      <div className="toolbar-center">
        {/* Breadcrumb navigation */}
        <div className="breadcrumb">
          <span
            className="breadcrumb-item"
            onClick={() => onNavigateTo('/')}
          >
            🖥️ Root
          </span>
          {getPathBreadcrumbs().map((crumb, index) => (
            <React.Fragment key={crumb.path}>
              <span className="breadcrumb-separator">/</span>
              <span
                className="breadcrumb-item"
                onClick={() => onNavigateTo(crumb.path)}
              >
                {crumb.name}
              </span>
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="toolbar-right">
        {/* View mode toggle */}
        <div className="view-mode-toggle">
          <button
            className={`toolbar-button ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => onViewModeChange('grid')}
            title="Grid view"
          >
            🔲
          </button>
          <button
            className={`toolbar-button ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => onViewModeChange('list')}
            title="List view"
          >
            📋
          </button>
        </div>

        {/* Sort options */}
        <select
          className="toolbar-select"
          value={sortBy}
          onChange={(e) => onSortByChange(e.target.value)}
        >
          <option value="name">Name</option>
          <option value="type">Type</option>
          <option value="size">Size</option>
          <option value="date">Date</option>
        </select>

        <button
          className="toolbar-button"
          onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
          title={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
        >
          {sortOrder === 'asc' ? '↑' : '↓'}
        </button>

        {/* File operations */}
        <button
          className="toolbar-button"
          onClick={() => setShowCreateDialog(true)}
          title="Create new folder or file"
        >
          ➕ New
        </button>

        {selectedItems.length > 0 && (
          <>
            <button
              className="toolbar-button"
              onClick={handleRename}
              disabled={selectedItems.length !== 1}
              title="Rename selected item"
            >
              ✏️ Rename
            </button>

            <button
              className="toolbar-button danger"
              onClick={handleDelete}
              title="Delete selected items"
            >
              🗑️ Delete
            </button>
          </>
        )}
      </div>

      {/* Create dialog */}
      {showCreateDialog && (
        <div className="create-dialog-overlay" onClick={() => setShowCreateDialog(false)}>
          <div className="create-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>Create New</h3>
            
            <div className="create-type-selector">
              <label>
                <input
                  type="radio"
                  value="folder"
                  checked={createType === 'folder'}
                  onChange={(e) => setCreateType(e.target.value)}
                />
                📁 Folder
              </label>
              <label>
                <input
                  type="radio"
                  value="file"
                  checked={createType === 'file'}
                  onChange={(e) => setCreateType(e.target.value)}
                />
                📄 File
              </label>
            </div>

            <div className="create-input-group">
              <label>Name:</label>
              <input
                type="text"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                placeholder={`New ${createType}`}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleCreate();
                  if (e.key === 'Escape') setShowCreateDialog(false);
                }}
                autoFocus
              />
            </div>

            <div className="create-dialog-buttons">
              <button
                className="toolbar-button"
                onClick={handleCreate}
                disabled={!createName.trim()}
              >
                Create
              </button>
              <button
                className="toolbar-button"
                onClick={() => setShowCreateDialog(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileToolbar; 