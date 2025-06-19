import React from 'react';
import './ContextMenu.css';

const ContextMenu = ({ x, y, onAction, menuType }) => {
  let menuItems;
  
  if (menuType === 'icon') {
    // Icon context menu (right-click on desktop icons)
    menuItems = [
      { id: 'open', label: 'Open', icon: '📂' },
      { id: 'view', label: 'View', icon: '👁️' },
      { id: 'properties', label: 'Properties', icon: '⚙️' }
    ];
  } else {
    // Desktop context menu (right-click on empty desktop area)
    menuItems = [
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
      { id: 'separator-1', label: 'separator' }, // Visual separator
      { id: 'new-folder', label: 'New Folder', icon: '📁' },
      { id: 'new-file', label: 'New File', icon: '📄' },
      { id: 'paste', label: 'Paste', icon: '📋' },
      { id: 'separator-2', label: 'separator' }, // Visual separator
      { id: 'change-wallpaper', label: 'Change Wallpaper', icon: '🖼️' },
      { id: 'personalize', label: 'Personalize', icon: '🎨' },
      { id: 'separator-3', label: 'separator' }, // Visual separator
      { id: 'properties', label: 'Properties', icon: '⚙️' }
    ];
  }

  const handleItemClick = (itemId) => {
    // Don't trigger action for separators
    if (itemId.startsWith('separator')) return;
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
      {menuItems.map((item) => {
        // Render separator
        if (item.label === 'separator') {
          return (
            <div key={item.id} className="context-menu-separator"></div>
          );
        }

        return (
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
        );
      })}
    </div>
  );
};

export default ContextMenu;