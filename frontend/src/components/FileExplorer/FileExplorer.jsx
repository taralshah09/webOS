import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import fileService from '../../services/fileService';
import FileTree from './FileTree';
import FileGrid from './FileGrid';
import FileToolbar from './FileToolbar';
import FileContextMenu from './FileContextMenu';
import './FileExplorer.css';

const FileExplorer = () => {
  const { user } = useAuth();
  const [fileSystem, setFileSystem] = useState({});
  const [currentPath, setCurrentPath] = useState('/');
  const [selectedItems, setSelectedItems] = useState([]);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, target: null });
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('name'); // 'name', 'type', 'size', 'date'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'

  const createDefaultFileSystem = useCallback(() => {
    const defaultFS = {
      '/': {
        type: 'folder',
        name: 'Root',
        children: ['/Documents', '/Pictures', '/Downloads', '/Desktop'],
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
        size: 0
      },
      '/Documents': {
        type: 'folder',
        name: 'Documents',
        children: ['/Documents/Work', '/Documents/Personal'],
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
        size: 0
      },
      '/Documents/Work': {
        type: 'folder',
        name: 'Work',
        children: ['/Documents/Work/report.txt', '/Documents/Work/presentation.pptx', '/Documents/Work/sample.js', '/Documents/Work/config.json', '/Documents/Work/README.md'],
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
        size: 0
      },
      '/Documents/Work/report.txt': {
        type: 'file',
        name: 'report.txt',
        extension: 'txt',
        size: 2048,
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
        content: `# Monthly Report - Q1 2024

## Executive Summary
This report covers the first quarter performance metrics and key achievements.

## Key Metrics
- Revenue: $2.5M (+15% YoY)
- Customer Acquisition: 1,200 new users
- Platform Uptime: 99.9%

## Achievements
1. Launched new mobile app
2. Improved customer satisfaction scores
3. Reduced operational costs by 12%

## Next Steps
- Expand to new markets
- Enhance product features
- Strengthen partnerships

---
*Generated on ${new Date().toLocaleDateString()}*
`
      },
      '/Documents/Work/presentation.pptx': {
        type: 'file',
        name: 'presentation.pptx',
        extension: 'pptx',
        size: 15360,
        created: new Date().toISOString(),
        modified: new Date().toISOString()
      },
      '/Documents/Personal': {
        type: 'folder',
        name: 'Personal',
        children: ['/Documents/Personal/notes.txt'],
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
        size: 0
      },
      '/Documents/Personal/notes.txt': {
        type: 'file',
        name: 'notes.txt',
        extension: 'txt',
        size: 512,
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
        content: `Personal Notes

TODO:
- Buy groceries
- Call dentist
- Schedule car maintenance
- Plan weekend trip

Ideas:
- Start learning React
- Read that new book
- Try that new restaurant

Reminders:
- Mom's birthday next week
- Pay electricity bill
- Return library books

---
Last updated: ${new Date().toLocaleDateString()}
`
      },
      '/Documents/Work/sample.js': {
        type: 'file',
        name: 'sample.js',
        extension: 'js',
        size: 1024,
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
        content: `// Sample JavaScript file for Web OS
// This demonstrates syntax highlighting in Monaco Editor

class WebOS {
  constructor() {
    this.name = 'Web OS';
    this.version = '1.0.0';
    this.features = [
      'Desktop Environment',
      'Window Management',
      'File Explorer',
      'Monaco Editor'
    ];
  }

  initialize() {
    console.log(\`Welcome to \${this.name} v\${this.version}!\`);
    this.features.forEach(feature => {
      console.log(\`✓ \${feature}\`);
    });
  }

  openFile(filePath) {
    return new Promise((resolve, reject) => {
      try {
        // File opening logic here
        console.log(\`Opening file: \${filePath}\`);
        resolve({ success: true, path: filePath });
      } catch (error) {
        reject(error);
      }
    });
  }
}

// Create and initialize Web OS
const webOS = new WebOS();
webOS.initialize();

// Export for use in other modules
export default webOS;
`
      },
      '/Documents/Work/config.json': {
        type: 'file',
        name: 'config.json',
        extension: 'json',
        size: 768,
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
        content: `{
  "app": {
    "name": "Web OS",
    "version": "1.0.0",
    "description": "A modern web-based operating system"
  },
  "features": {
    "desktop": {
      "enabled": true,
      "background": "gradient",
      "icons": true
    },
    "windows": {
      "enabled": true,
      "draggable": true,
      "resizable": true,
      "minimizable": true,
      "maximizable": true
    },
    "fileExplorer": {
      "enabled": true,
      "treeView": true,
      "gridView": true,
      "listView": true
    },
    "notepad": {
      "enabled": true,
      "monacoEditor": true,
      "syntaxHighlighting": true,
      "themes": ["vs-dark", "vs-light", "hc-black"]
    }
  },
  "settings": {
    "theme": "dark",
    "language": "en",
    "timezone": "UTC"
  }
}`
      },
      '/Documents/Work/README.md': {
        type: 'file',
        name: 'README.md',
        extension: 'md',
        size: 2048,
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
        content: `# Web OS - Modern Web-Based Operating System

## Overview
Web OS is a cutting-edge web-based operating system that brings the power and flexibility of modern desktop environments to the web browser.

## Features

### 🖥️ Desktop Environment
- **Full-screen desktop** with beautiful gradient backgrounds
- **Draggable desktop icons** with selection and double-click functionality
- **Right-click context menus** with system options
- **Professional glassmorphism UI** design

### 🪟 Window Management
- **Draggable and resizable windows** with smooth animations
- **Z-index management** for proper window layering
- **Window controls** (minimize, maximize, close)
- **Multiple window support** with independent positioning

### 📁 File System Explorer
- **Tree view navigation** with expand/collapse functionality
- **Grid and list view modes** with sorting options
- **File operations** (create, rename, delete, copy, cut, paste)
- **Context menus** with file-specific actions
- **Breadcrumb navigation** for easy path tracking

### 📝 Professional Text Editor
- **Monaco Editor integration** (same as VS Code)
- **Syntax highlighting** for 20+ programming languages
- **IntelliSense and auto-completion**
- **Multiple themes** (Dark, Light, High Contrast)
- **Line numbers and minimap**
- **File opening integration** from File Explorer

## Supported File Types
- **Text files**: .txt, .md
- **Code files**: .js, .jsx, .ts, .tsx, .html, .css, .json
- **Programming languages**: .py, .java, .cpp, .c, .php, .rb, .go, .rs, .swift, .kt
- **Data formats**: .xml, .yaml, .yml, .sql

## Getting Started

1. **Login** to your Web OS account
2. **Navigate** the desktop using desktop icons
3. **Open File Explorer** to browse your file system
4. **Double-click files** to open them in the appropriate application
5. **Use Notepad** for text editing with professional features

## Technology Stack
- **Frontend**: React 18, Vite
- **Editor**: Monaco Editor (VS Code's editor)
- **Styling**: CSS3 with glassmorphism effects
- **State Management**: React Hooks and Context API

## Development
\`\`\`bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
\`\`\`

## Contributing
We welcome contributions! Please feel free to submit pull requests or open issues.

## License
MIT License - see LICENSE file for details.

---
*Built with ❤️ for the modern web*
`
      },
      '/Pictures': {
        type: 'folder',
        name: 'Pictures',
        children: ['/Pictures/vacation.jpg', '/Pictures/family.png'],
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
        size: 0
      },
      '/Pictures/vacation.jpg': {
        type: 'file',
        name: 'vacation.jpg',
        extension: 'jpg',
        size: 2048576,
        created: new Date().toISOString(),
        modified: new Date().toISOString()
      },
      '/Pictures/family.png': {
        type: 'file',
        name: 'family.png',
        extension: 'png',
        size: 1048576,
        created: new Date().toISOString(),
        modified: new Date().toISOString()
      },
      '/Downloads': {
        type: 'folder',
        name: 'Downloads',
        children: ['/Downloads/setup.exe', '/Downloads/document.pdf'],
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
        size: 0
      },
      '/Downloads/setup.exe': {
        type: 'file',
        name: 'setup.exe',
        extension: 'exe',
        size: 52428800,
        created: new Date().toISOString(),
        modified: new Date().toISOString()
      },
      '/Downloads/document.pdf': {
        type: 'file',
        name: 'document.pdf',
        extension: 'pdf',
        size: 2097152,
        created: new Date().toISOString(),
        modified: new Date().toISOString()
      },
      '/Desktop': {
        type: 'folder',
        name: 'Desktop',
        children: ['/Desktop/readme.txt'],
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
        size: 0
      },
      '/Desktop/readme.txt': {
        type: 'file',
        name: 'readme.txt',
        extension: 'txt',
        size: 1024,
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
        content: 'Welcome to Web OS!\n\nThis is your desktop folder.'
      }
    };
    setFileSystem(defaultFS);
  }, []);

  // Initialize file system from localStorage or create default structure
  useEffect(() => {
    const loadFileSystem = () => {
      const stored = localStorage.getItem(`webos_filesystem_${user?.id}`);
      if (stored) {
        try {
          setFileSystem(JSON.parse(stored));
        } catch (error) {
          console.error('Error loading file system:', error);
          createDefaultFileSystem();
        }
      } else {
        createDefaultFileSystem();
      }
    };

    loadFileSystem();
  }, [user?.id, createDefaultFileSystem]);

  // Save file system to localStorage whenever it changes
  useEffect(() => {
    if (Object.keys(fileSystem).length > 0) {
      localStorage.setItem(`webos_filesystem_${user?.id}`, JSON.stringify(fileSystem));
    }
  }, [fileSystem, user?.id]);

  // Get current directory contents
  const getCurrentDirectoryContents = useCallback(() => {
    const currentDir = fileSystem[currentPath];
    if (!currentDir || currentDir.type !== 'folder') return [];

    return currentDir.children
      .map(childPath => ({
        path: childPath,
        ...fileSystem[childPath]
      }))
      .filter(item => item.name) // Filter out any invalid items
      .sort((a, b) => {
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
  }, [fileSystem, currentPath, sortBy, sortOrder]);

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

  // File operations
  const createFolder = (name) => {
    const newPath = `${currentPath}${currentPath.endsWith('/') ? '' : '/'}${name}`;
    if (fileSystem[newPath]) {
      throw new Error('A folder with this name already exists');
    }

    const newFolder = {
      type: 'folder',
      name,
      children: [],
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
      size: 0
    };

    setFileSystem(prev => {
      const updated = { ...prev };
      updated[newPath] = newFolder;
      
      // Check if the path is already in children to prevent duplicates
      if (!updated[currentPath].children.includes(newPath)) {
        updated[currentPath].children.push(newPath);
      }
      
      updated[currentPath].modified = new Date().toISOString();
      return updated;
    });
  };

  const createFile = (name, content = '') => {
    const extension = name.includes('.') ? name.split('.').pop() : '';
    const newPath = `${currentPath}${currentPath.endsWith('/') ? '' : '/'}${name}`;
    
    if (fileSystem[newPath]) {
      throw new Error('A file with this name already exists');
    }

    const newFile = {
      type: 'file',
      name,
      extension,
      size: content.length,
      content,
      created: new Date().toISOString(),
      modified: new Date().toISOString()
    };

    setFileSystem(prev => {
      const updated = { ...prev };
      updated[newPath] = newFile;
      
      // Check if the path is already in children to prevent duplicates
      if (!updated[currentPath].children.includes(newPath)) {
        updated[currentPath].children.push(newPath);
      }
      
      updated[currentPath].modified = new Date().toISOString();
      return updated;
    });
  };

  const deleteItems = (paths) => {
    const pathsToDelete = Array.isArray(paths) ? paths : [paths];
    
    setFileSystem(prev => {
      const updated = { ...prev };
      
      pathsToDelete.forEach(path => {
        // Remove from parent's children array
        const parentPath = path.split('/').slice(0, -1).join('/') || '/';
        if (updated[parentPath]) {
          updated[parentPath].children = updated[parentPath].children.filter(child => child !== path);
          updated[parentPath].modified = new Date().toISOString();
        }
        
        // Delete the item itself
        delete updated[path];
      });
      
      return updated;
    });
    
    setSelectedItems([]);
  };

  const renameItem = (oldPath, newName) => {
    const parentPath = oldPath.split('/').slice(0, -1).join('/') || '/';
    const newPath = `${parentPath}${parentPath.endsWith('/') ? '' : '/'}${newName}`;
    
    if (fileSystem[newPath]) {
      throw new Error('An item with this name already exists');
    }

    setFileSystem(prev => {
      const updated = { ...prev };
      const item = updated[oldPath];
      
      // Update the item
      item.name = newName;
      item.modified = new Date().toISOString();
      if (item.type === 'file' && item.name.includes('.')) {
        item.extension = item.name.split('.').pop();
      }
      
      // Move to new path
      updated[newPath] = item;
      delete updated[oldPath];
      
      // Update parent's children array
      updated[parentPath].children = updated[parentPath].children.map(child => 
        child === oldPath ? newPath : child
      );
      updated[parentPath].modified = new Date().toISOString();
      
      return updated;
    });
  };

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

  const currentContents = getCurrentDirectoryContents();

  return (
    <div className="file-explorer">
      <FileToolbar
        currentPath={currentPath}
        onNavigateUp={navigateUp}
        onNavigateTo={navigateTo}
        onCreateFolder={createFolder}
        onCreateFile={createFile}
        onDelete={() => deleteItems(selectedItems)}
        onRename={(oldPath, newName) => renameItem(oldPath, newName)}
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
            onDoubleClick={(item) => {
              if (item.type === 'folder') {
                navigateTo(item.path);
              } else {
                // Open file using the file service
                const fileContent = fileSystem[item.path]?.content || '';
                fileService.openFile(item.path, fileContent, item.extension);
              }
            }}
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
          onCreateFolder={createFolder}
          onCreateFile={createFile}
          onDelete={deleteItems}
          onRename={renameItem}
          onClose={() => setContextMenu({ visible: false, x: 0, y: 0, target: null })}
        />
      )}
    </div>
  );
};

export default FileExplorer; 