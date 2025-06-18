import React, { useState } from 'react';
import './FileContextMenu.css';

const FileContextMenu = ({
  x,
  y,
  target,
  currentPath,
  selectedItems,
  onCreateFolder,
  onCreateFile,
  onDelete,
  onRename,
  onClose
}) => {
  const [showCreateSubmenu, setShowCreateSubmenu] = useState(false);

  const handleAction = (action) => {
    switch (action) {
      case 'new-folder':
        const folderName = prompt('Enter folder name:');
        if (folderName && folderName.trim()) {
          try {
            onCreateFolder(folderName.trim());
          } catch (error) {
            alert(error.message);
          }
        }
        break;
      
      case 'new-file':
        const fileName = prompt('Enter file name:');
        if (fileName && fileName.trim()) {
          try {
            onCreateFile(fileName.trim());
          } catch (error) {
            alert(error.message);
          }
        }
        break;
      
      case 'delete':
        if (selectedItems.length === 0) return;
        const itemText = selectedItems.length === 1 ? 'this item' : 'these items';
        if (confirm(`Are you sure you want to delete ${itemText}?`)) {
          onDelete(selectedItems);
        }
        break;
      
      case 'rename':
        if (selectedItems.length !== 1) return;
        const newName = prompt('Enter new name:');
        if (newName && newName.trim()) {
          try {
            onRename(selectedItems[0], newName.trim());
          } catch (error) {
            alert(error.message);
          }
        }
        break;
      
      case 'copy':
        // TODO: Implement copy functionality
        console.log('Copy:', selectedItems);
        break;
      
      case 'cut':
        // TODO: Implement cut functionality
        console.log('Cut:', selectedItems);
        break;
      
      case 'paste':
        // TODO: Implement paste functionality
        console.log('Paste');
        break;
      
      case 'properties':
        // TODO: Show properties dialog
        console.log('Properties:', selectedItems);
        break;
    }
    onClose();
  };

  const isTargetSelected = target && selectedItems.includes(target.path);
  const hasSelection = selectedItems.length > 0;

  return (
    <div
      className="file-context-menu"
      style={{ left: `${x}px`, top: `${y}px` }}
    >
      {/* New submenu */}
      <div className="context-menu-item has-submenu">
        <div className="context-menu-item-content">
          <span className="context-menu-icon">➕</span>
          <span className="context-menu-label">New</span>
          <span className="context-menu-arrow">▶</span>
        </div>
        <div className="context-submenu">
          <div
            className="context-menu-item"
            onClick={() => handleAction('new-folder')}
          >
            <span className="context-menu-icon">📁</span>
            <span className="context-menu-label">Folder</span>
          </div>
          <div
            className="context-menu-item"
            onClick={() => handleAction('new-file')}
          >
            <span className="context-menu-icon">📄</span>
            <span className="context-menu-label">Text Document</span>
          </div>
        </div>
      </div>

      <div className="context-menu-separator"></div>

      {/* Selection-based actions */}
      {hasSelection && (
        <>
          <div
            className="context-menu-item"
            onClick={() => handleAction('copy')}
          >
            <span className="context-menu-icon">📋</span>
            <span className="context-menu-label">Copy</span>
          </div>
          
          <div
            className="context-menu-item"
            onClick={() => handleAction('cut')}
          >
            <span className="context-menu-icon">✂️</span>
            <span className="context-menu-label">Cut</span>
          </div>
        </>
      )}

      <div
        className="context-menu-item"
        onClick={() => handleAction('paste')}
      >
        <span className="context-menu-icon">📋</span>
        <span className="context-menu-label">Paste</span>
      </div>

      {hasSelection && (
        <>
          <div className="context-menu-separator"></div>
          
          <div
            className="context-menu-item"
            onClick={() => handleAction('rename')}
            disabled={selectedItems.length !== 1}
          >
            <span className="context-menu-icon">✏️</span>
            <span className="context-menu-label">Rename</span>
          </div>
          
          <div
            className="context-menu-item danger"
            onClick={() => handleAction('delete')}
          >
            <span className="context-menu-icon">🗑️</span>
            <span className="context-menu-label">Delete</span>
          </div>
        </>
      )}

      <div className="context-menu-separator"></div>

      {/* View options */}
      <div className="context-menu-item has-submenu">
        <div className="context-menu-item-content">
          <span className="context-menu-icon">👁️</span>
          <span className="context-menu-label">View</span>
          <span className="context-menu-arrow">▶</span>
        </div>
        <div className="context-submenu">
          <div className="context-menu-item">
            <span className="context-menu-label">Large Icons</span>
          </div>
          <div className="context-menu-item">
            <span className="context-menu-label">Small Icons</span>
          </div>
          <div className="context-menu-item">
            <span className="context-menu-label">List</span>
          </div>
          <div className="context-menu-item">
            <span className="context-menu-label">Details</span>
          </div>
        </div>
      </div>

      {/* Sort options */}
      <div className="context-menu-item has-submenu">
        <div className="context-menu-item-content">
          <span className="context-menu-icon">📊</span>
          <span className="context-menu-label">Sort By</span>
          <span className="context-menu-arrow">▶</span>
        </div>
        <div className="context-submenu">
          <div className="context-menu-item">
            <span className="context-menu-label">Name</span>
          </div>
          <div className="context-menu-item">
            <span className="context-menu-label">Type</span>
          </div>
          <div className="context-menu-item">
            <span className="context-menu-label">Size</span>
          </div>
          <div className="context-menu-item">
            <span className="context-menu-label">Date Modified</span>
          </div>
        </div>
      </div>

      {hasSelection && (
        <>
          <div className="context-menu-separator"></div>
          
          <div
            className="context-menu-item"
            onClick={() => handleAction('properties')}
          >
            <span className="context-menu-icon">⚙️</span>
            <span className="context-menu-label">Properties</span>
          </div>
        </>
      )}
    </div>
  );
};

export default FileContextMenu; 