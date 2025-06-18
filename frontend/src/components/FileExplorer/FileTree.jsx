import React, { useState } from 'react';
import './FileTree.css';

const FileTree = ({ fileSystem, currentPath, onNavigate, onContextMenu }) => {
  const [expandedFolders, setExpandedFolders] = useState(new Set(['/']));

  const toggleFolder = (path) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  };

  const getFolderIcon = (path) => {
    if (path === '/') return '🖥️';
    if (path.includes('/Documents')) return '📁';
    if (path.includes('/Pictures')) return '🖼️';
    if (path.includes('/Downloads')) return '⬇️';
    if (path.includes('/Desktop')) return '🖥️';
    return '📁';
  };

  const renderTreeItem = (path, level = 0) => {
    const item = fileSystem[path];
    if (!item || item.type !== 'folder') return null;

    const isExpanded = expandedFolders.has(path);
    const isCurrent = currentPath === path;
    const hasChildren = item.children && item.children.length > 0;
    const childFolders = item.children?.filter(childPath => 
      fileSystem[childPath]?.type === 'folder'
    ) || [];

    return (
      <div key={path} className="tree-item-container">
        <div
          className={`tree-item ${isCurrent ? 'current' : ''}`}
          style={{ paddingLeft: `${level * 20 + 8}px` }}
          onClick={() => onNavigate(path)}
          onContextMenu={(e) => onContextMenu(e, path)}
        >
          <div className="tree-item-content">
            <button
              className={`expand-button ${hasChildren ? '' : 'hidden'}`}
              onClick={(e) => {
                e.stopPropagation();
                toggleFolder(path);
              }}
            >
              {isExpanded ? '▼' : '▶'}
            </button>
            
            <span className="tree-item-icon">
              {getFolderIcon(path)}
            </span>
            
            <span className="tree-item-name">
              {item.name}
            </span>
          </div>
        </div>
        
        {isExpanded && hasChildren && (
          <div className="tree-children">
            {childFolders.map(childPath => 
              renderTreeItem(childPath, level + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  const rootFolders = fileSystem['/']?.children?.filter(path => 
    fileSystem[path]?.type === 'folder'
  ) || [];

  return (
    <div className="file-tree">
      <div className="tree-header">
        <h3>File Explorer</h3>
      </div>
      
      <div className="tree-content">
        {renderTreeItem('/')}
      </div>
    </div>
  );
};

export default FileTree; 