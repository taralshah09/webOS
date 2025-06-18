import React from 'react';
import './ContextMenu.css';

const ContextMenu = ({ x, y, onAction }) => {
  const menuItems = [
    {
      id: 'view',
      label: 'View',
      icon: '👁️',
      submenu: [
        { id: 'large-icons', label: 'Large Icons' },
        { id: 'small-icons', label: 'Small Icons' },
        { id: 'list', label: 'List' },
        { id: 'details', label: 'Details' }
      ]
    },
    {
      id: 'sort-by',
      label: 'Sort By',
      icon: '📊',
      submenu: [
        { id: 'name', label: 'Name' },
        { id: 'size', label: 'Size' },
        { id: 'type', label: 'Type' },
        { id: 'date', label: 'Date Modified' }
      ]
    },
    { id: 'refresh', label: 'Refresh', icon: '🔄' },
    { id: 'new-folder', label: 'New Folder', icon: '📁' },
    { id: 'new-file', label: 'New File', icon: '📄' },
    { id: 'paste', label: 'Paste', icon: '📋' },
    { id: 'properties', label: 'Properties', icon: '⚙️' }
  ];

  const handleItemClick = (itemId) => {
    onAction(itemId);
  };

  const handleSubmenuItemClick = (parentId, subItemId) => {
    onAction(`${parentId}-${subItemId}`);
  };

  return (
    <div 
      className="context-menu"
      style={{
        left: `${x}px`,
        top: `${y}px`
      }}
    >
      {menuItems.map((item) => (
        <div key={item.id} className="context-menu-item">
          {item.submenu ? (
            <div className="context-menu-item-with-submenu">
              <div className="context-menu-item-content">
                <span className="context-menu-icon">{item.icon}</span>
                <span className="context-menu-label">{item.label}</span>
                <span className="context-menu-arrow">▶</span>
              </div>
              <div className="context-submenu">
                {item.submenu.map((subItem) => (
                  <div
                    key={subItem.id}
                    className="context-menu-item"
                    onClick={() => handleSubmenuItemClick(item.id, subItem.id)}
                  >
                    <span className="context-menu-label">{subItem.label}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div
              className="context-menu-item-content"
              onClick={() => handleItemClick(item.id)}
            >
              <span className="context-menu-icon">{item.icon}</span>
              <span className="context-menu-label">{item.label}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ContextMenu; 