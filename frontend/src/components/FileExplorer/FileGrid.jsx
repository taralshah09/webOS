import React, { useState } from 'react';
import './FileGrid.css';

const FileGrid = ({ 
  items, 
  currentPath, 
  selectedItems, 
  onSelectItems, 
  onNavigate, 
  onContextMenu, 
  viewMode, 
  onDoubleClick 
}) => {
  const [editingItem, setEditingItem] = useState(null);
  const [editName, setEditName] = useState('');

  const getFileIcon = (item) => {
    if (item.type === 'folder') {
      if (item.path.includes('/Documents')) return '📁';
      if (item.path.includes('/Pictures')) return '🖼️';
      if (item.path.includes('/Downloads')) return '⬇️';
      if (item.path.includes('/Desktop')) return '🖥️';
      return '📁';
    }

    // File icons based on extension
    const ext = item.extension?.toLowerCase();
    switch (ext) {
      case 'txt': return '📄';
      case 'pdf': return '📕';
      case 'doc':
      case 'docx': return '📘';
      case 'xls':
      case 'xlsx': return '📗';
      case 'ppt':
      case 'pptx': return '📙';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'bmp': return '🖼️';
      case 'mp3':
      case 'wav':
      case 'flac': return '🎵';
      case 'mp4':
      case 'avi':
      case 'mov': return '🎬';
      case 'zip':
      case 'rar':
      case '7z': return '📦';
      case 'exe': return '⚙️';
      default: return '📄';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleItemClick = (e, item) => {
    if (e.ctrlKey || e.metaKey) {
      // Multi-select with Ctrl/Cmd
      const newSelection = selectedItems.includes(item.path)
        ? selectedItems.filter(path => path !== item.path)
        : [...selectedItems, item.path];
      onSelectItems(newSelection);
    } else if (e.shiftKey && selectedItems.length > 0) {
      // Range select with Shift
      const currentIndex = items.findIndex(i => i.path === item.path);
      const lastSelectedIndex = items.findIndex(i => i.path === selectedItems[selectedItems.length - 1]);
      const start = Math.min(currentIndex, lastSelectedIndex);
      const end = Math.max(currentIndex, lastSelectedIndex);
      const range = items.slice(start, end + 1).map(i => i.path);
      onSelectItems(range);
    } else {
      // Single select
      onSelectItems([item.path]);
    }
  };

  const handleItemDoubleClick = (item) => {
    if (editingItem) return; // Don't navigate if editing
    onDoubleClick(item);
  };

  const startEditing = (item) => {
    setEditingItem(item.path);
    setEditName(item.name);
  };

  const handleEditKeyPress = (e, item) => {
    if (e.key === 'Enter') {
      // Save the edit
      const newName = editName.trim();
      if (newName && newName !== item.name) {
        // This would call the rename function from parent
        console.log('Rename:', item.path, 'to', newName);
      }
      setEditingItem(null);
      setEditName('');
    } else if (e.key === 'Escape') {
      setEditingItem(null);
      setEditName('');
    }
  };

  const isSelected = (item) => selectedItems.includes(item.path);

  if (viewMode === 'list') {
    return (
      <div className="file-grid list-view">
        <div className="list-header">
          <div className="list-header-name">Name</div>
          <div className="list-header-type">Type</div>
          <div className="list-header-size">Size</div>
          <div className="list-header-date">Date Modified</div>
        </div>
        
        <div className="list-content">
          {items.map(item => (
            <div
              key={item.path}
              className={`list-item ${isSelected(item) ? 'selected' : ''}`}
              onClick={(e) => handleItemClick(e, item)}
              onDoubleClick={() => handleItemDoubleClick(item)}
              onContextMenu={(e) => onContextMenu(e, item)}
            >
              <div className="list-item-name">
                <span className="list-item-icon">{getFileIcon(item)}</span>
                {editingItem === item.path ? (
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => handleEditKeyPress(e, item)}
                    onBlur={() => setEditingItem(null)}
                    autoFocus
                    className="edit-input"
                  />
                ) : (
                  <span>{item.name}</span>
                )}
              </div>
              <div className="list-item-type">
                {item.type === 'folder' ? 'File folder' : item.extension?.toUpperCase() || 'File'}
              </div>
              <div className="list-item-size">
                {item.type === 'folder' ? '--' : formatFileSize(item.size)}
              </div>
              <div className="list-item-date">
                {formatDate(item.modified)}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div className="file-grid grid-view">
      {items.map(item => (
        <div
          key={item.path}
          className={`grid-item ${isSelected(item) ? 'selected' : ''}`}
          onClick={(e) => handleItemClick(e, item)}
          onDoubleClick={() => handleItemDoubleClick(item)}
          onContextMenu={(e) => onContextMenu(e, item)}
        >
          <div className="grid-item-icon">
            {getFileIcon(item)}
          </div>
          
          <div className="grid-item-name">
            {editingItem === item.path ? (
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => handleEditKeyPress(e, item)}
                onBlur={() => setEditingItem(null)}
                autoFocus
                className="edit-input"
              />
            ) : (
              <span title={item.name}>{item.name}</span>
            )}
          </div>
          
          <div className="grid-item-details">
            <span className="grid-item-type">
              {item.type === 'folder' ? 'File folder' : item.extension?.toUpperCase() || 'File'}
            </span>
            <span className="grid-item-size">
              {item.type === 'folder' ? '--' : formatFileSize(item.size)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FileGrid; 