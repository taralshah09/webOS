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
  onEdit,
  onClose,
  fileService
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
      
      case 'new-text-file':
        const fileName = prompt('Enter file name (e.g., document.txt):');
        if (fileName && fileName.trim()) {
          try {
            onCreateFile(fileName.trim(), '');
          } catch (error) {
            alert(error.message);
          }
        }
        break;

      case 'new-js-file':
        const jsFileName = prompt('Enter JavaScript file name (e.g., script.js):');
        if (jsFileName && jsFileName.trim()) {
          const template = '// JavaScript file\n// Created on ' + new Date().toLocaleDateString() + '\n\nconsole.log("Hello, WebOS!");\n';
          try {
            onCreateFile(jsFileName.trim(), template);
          } catch (error) {
            alert(error.message);
          }
        }
        break;

      case 'new-html-file':
        const htmlFileName = prompt('Enter HTML file name (e.g., index.html):');
        if (htmlFileName && htmlFileName.trim()) {
          const template = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <h1>Hello, WebOS!</h1>
    <p>This HTML file was created in the WebOS file system.</p>
</body>
</html>`;
          try {
            onCreateFile(htmlFileName.trim(), template);
          } catch (error) {
            alert(error.message);
          }
        }
        break;

      case 'new-css-file':
        const cssFileName = prompt('Enter CSS file name (e.g., styles.css):');
        if (cssFileName && cssFileName.trim()) {
          const template = `/* CSS file created on ${new Date().toLocaleDateString()} */

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    margin: 0;
    padding: 20px;
    background-color: #f5f5f5;
}

h1 {
    color: #333;
    text-align: center;
}

.container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}`;
          try {
            onCreateFile(cssFileName.trim(), template);
          } catch (error) {
            alert(error.message);
          }
        }
        break;

      case 'new-md-file':
        const mdFileName = prompt('Enter Markdown file name (e.g., README.md):');
        if (mdFileName && mdFileName.trim()) {
          const template = `# ${mdFileName.replace('.md', '')}

Created on ${new Date().toLocaleDateString()}

## Description

This is a **Markdown** file created in the WebOS file system.

### Features

- Rich text formatting
- Syntax highlighting
- Live preview
- File system integration

### Code Example

\`\`\`javascript
const greeting = "Hello, WebOS!";
console.log(greeting);
\`\`\`

---

*Edit this file to add your content!*`;
          try {
            onCreateFile(mdFileName.trim(), template);
          } catch (error) {
            alert(error.message);
          }
        }
        break;

      case 'edit':
        if (selectedItems.length === 1 && onEdit) {
          onEdit(selectedItems[0]);
        }
        break;

      case 'open-with-editor':
        if (target && onEdit) {
          onEdit(target.path);
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
  const canEdit = target && fileService?.isFileEditable(target.path);
  const selectedItemsEditable = selectedItems.length === 1 && selectedItems.some(path => 
    fileService?.isFileEditable(path)
  );

  return (
    <div
      className="file-context-menu"
      style={{ left: `${x}px`, top: `${y}px` }}
    >
      {/* File-specific actions */}
      {target && target.type === 'file' && (
        <>
          <div
            className="context-menu-item"
            onClick={() => handleAction('open-with-editor')}
          >
            <span className="context-menu-icon">📂</span>
            <span className="context-menu-label">Open</span>
          </div>

          {canEdit && (
            <div
              className="context-menu-item"
              onClick={() => handleAction('open-with-editor')}
            >
              <span className="context-menu-icon">✏️</span>
              <span className="context-menu-label">Edit in Notepad</span>
            </div>
          )}

          <div className="context-menu-separator"></div>
        </>
      )}

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
          <div className="context-menu-separator"></div>
          <div
            className="context-menu-item"
            onClick={() => handleAction('new-text-file')}
          >
            <span className="context-menu-icon">📄</span>
            <span className="context-menu-label">Text Document</span>
          </div>
          <div
            className="context-menu-item"
            onClick={() => handleAction('new-js-file')}
          >
            <span className="context-menu-icon">📜</span>
            <span className="context-menu-label">JavaScript File</span>
          </div>
          <div
            className="context-menu-item"
            onClick={() => handleAction('new-html-file')}
          >
            <span className="context-menu-icon">🌐</span>
            <span className="context-menu-label">HTML File</span>
          </div>
          <div
            className="context-menu-item"
            onClick={() => handleAction('new-css-file')}
          >
            <span className="context-menu-icon">🎨</span>
            <span className="context-menu-label">CSS File</span>
          </div>
          <div
            className="context-menu-item"
            onClick={() => handleAction('new-md-file')}
          >
            <span className="context-menu-icon">📝</span>
            <span className="context-menu-label">Markdown File</span>
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

          {selectedItemsEditable && (
            <div
              className="context-menu-item"
              onClick={() => handleAction('edit')}
            >
              <span className="context-menu-icon">✏️</span>
              <span className="context-menu-label">Edit</span>
            </div>
          )}
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