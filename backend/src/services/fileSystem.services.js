import { FileSystem } from '../models/fileSystem.models.js';

export const createUserDefaultFileSystem = async (userId) => {
  try {
    console.log(`🔄 Creating default file system for user: ${userId}`);

    // Default folder structure
    const defaultFolders = [
      { name: 'Documents', path: '/Documents' },
      { name: 'Downloads', path: '/Downloads' },
      { name: 'Pictures', path: '/Pictures' },
      { name: 'Desktop', path: '/Desktop' },
      { name: 'Videos', path: '/Videos' },
      { name: 'Music', path: '/Music' }
    ];

    // Sample files with content
    const sampleFiles = [
      {
        name: 'Welcome.txt',
        path: '/Documents/Welcome.txt',
        parentPath: '/Documents',
        content: `Welcome to WebOS File System!

This is your personal file system where you can:
• Create and organize files and folders
• Edit text files with the built-in Notepad
• Save your work automatically to the database
• Access your files from anywhere

Getting Started:
1. Double-click any text file to open it in Notepad
2. Create new files using the right-click context menu
3. Edit and save files - changes are saved automatically
4. Organize your files in folders

Sample files have been created in your Documents folder to help you get started.

Enjoy your WebOS experience!`,
        mimeType: 'text/plain'
      },
      {
        name: 'sample.js',
        path: '/Documents/sample.js',
        parentPath: '/Documents',
        content: `// Welcome to WebOS JavaScript Editor!
// This file demonstrates syntax highlighting and code editing features

class WebOSDemo {
    constructor() {
        this.name = "WebOS File System";
        this.version = "1.0.0";
        this.features = [
            "Real-time file editing",
            "Syntax highlighting", 
            "Auto-save functionality",
            "Database persistence"
        ];
    }

    greet() {
        console.log(\`Welcome to \${this.name} v\${this.version}!\`);
        return "Happy coding in your virtual OS!";
    }

    listFeatures() {
        console.log("Features:");
        this.features.forEach((feature, index) => {
            console.log(\`\${index + 1}. \${feature}\`);
        });
    }
}

// Create instance and run demo
const demo = new WebOSDemo();
demo.greet();
demo.listFeatures();

// You can edit this file and save it!
// Try adding your own JavaScript code below:

`,
        mimeType: 'application/javascript'
      },
      {
        name: 'README.md',
        path: '/Documents/README.md',
        parentPath: '/Documents',
        content: `# Welcome to WebOS

## About WebOS
WebOS is a **web-based operating system** that provides a complete desktop experience in your browser.

## File System Features
- 📁 **Full file management** - Create, edit, delete files and folders
- 📝 **Built-in text editor** - Syntax highlighting for 20+ languages
- 💾 **Auto-save** - Your changes are automatically saved to the database
- 🔍 **Search functionality** - Find files by name or content
- 🗂️ **File organization** - Organize files in a familiar folder structure

## Supported File Types
WebOS supports editing many file types including:
- **Text files**: .txt, .md, .log
- **Web files**: .html, .css, .js, .jsx, .ts, .tsx
- **Programming**: .py, .java, .cpp, .c, .php, .rb, .go, .rs
- **Data files**: .json, .xml, .yaml, .sql

## Getting Started
1. **Navigate**: Use the File Explorer to browse your files
2. **Create**: Right-click to create new files and folders
3. **Edit**: Double-click text files to open in Notepad
4. **Save**: Files are automatically saved when you edit them

## Tips
- Use **Ctrl+S** to save files manually
- The editor supports **auto-completion** and **syntax highlighting**
- You can **search** for files using the search box
- Files are organized in a **hierarchical folder structure**

Enjoy exploring your virtual file system! 🚀`,
        mimeType: 'text/markdown'
      },
      {
        name: 'styles.css',
        path: '/Documents/styles.css',
        parentPath: '/Documents',
        content: `/* WebOS Sample CSS File */
/* This demonstrates CSS syntax highlighting */

:root {
    --primary-color: #0078d4;
    --secondary-color: #106ebe;
    --background-color: #f5f5f5;
    --text-color: #333;
    --border-radius: 8px;
    --shadow: 0 2px 10px rgba(0,0,0,0.1);
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    margin: 0;
    padding: 20px;
    background-color: var(--background-color);
    color: var(--text-color);
    line-height: 1.6;
}

.container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    background: white;
    border-radius: var(--border-radius);
    box-shadow: var(--shadow);
}

h1, h2, h3 {
    color: var(--primary-color);
    margin-top: 0;
}

.button {
    background: var(--primary-color);
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: var(--border-radius);
    cursor: pointer;
    transition: background-color 0.2s ease;
}

.button:hover {
    background: var(--secondary-color);
    transform: translateY(-1px);
}

.file-system {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 20px;
    margin-top: 20px;
}

.sidebar {
    background: #f8f9fa;
    padding: 15px;
    border-radius: var(--border-radius);
}

.main-content {
    padding: 15px;
}

/* Responsive design */
@media (max-width: 768px) {
    .file-system {
        grid-template-columns: 1fr;
    }
    
    .container {
        padding: 15px;
        margin: 10px;
    }
}`,
        mimeType: 'text/css'
      },
      {
        name: 'notes.txt',
        path: '/Desktop/notes.txt',
        parentPath: '/Desktop',
        content: `Quick Notes - Desktop

This is a sample note file on your desktop.

Todo:
☐ Explore the file system
☐ Try creating new files
☐ Edit files in Notepad
☐ Organize files in folders
☐ Test the search functionality

The WebOS file system supports:
- Real-time editing
- Auto-save functionality  
- Syntax highlighting
- File organization
- Search capabilities

Feel free to edit this file and add your own notes!`,
        mimeType: 'text/plain'
      }
    ];

    // Create folders first
    const createdFolders = {};
    for (const folder of defaultFolders) {
      const newFolder = await FileSystem.create({
        name: folder.name,
        type: 'folder',
        owner: userId,
        parent: null,
        path: folder.path,
        permissions: {
          read: true,
          write: true,
          execute: true
        }
      });
      createdFolders[folder.path] = newFolder;
      console.log(`📁 Created folder: ${folder.path}`);
    }

    // Create sample files
    for (const file of sampleFiles) {
      const parent = createdFolders[file.parentPath];
      
      const newFile = await FileSystem.create({
        name: file.name,
        type: 'file',
        owner: userId,
        parent: parent._id,
        path: file.path,
        content: file.content,
        mimeType: file.mimeType,
        size: Buffer.byteLength(file.content, 'utf8'),
        permissions: {
          read: true,
          write: true,
          execute: false
        }
      });

      // Add file to parent's children
      parent.children.push(newFile._id);
      await parent.save();

      console.log(`📄 Created file: ${file.path}`);
    }

    console.log(`✅ Default file system created successfully for user: ${userId}`);
    return true;

  } catch (error) {
    console.error(`❌ Error creating default file system for user ${userId}:`, error);
    return false;
  }
};

export const initializeUserFileSystem = async (userId) => {
  try {
    // Check if user already has a file system
    const existingFiles = await FileSystem.findOne({ owner: userId });
    
    if (existingFiles) {
      console.log(`📁 File system already exists for user: ${userId}`);
      return true;
    }

    // Create default file system
    return await createUserDefaultFileSystem(userId);
    
  } catch (error) {
    console.error('Error initializing user file system:', error);
    return false;
  }
};

// Helper function to get user's root directories
export const getUserRootDirectories = async (userId) => {
  try {
    return await FileSystem.find({
      owner: userId,
      parent: null,
      type: 'folder'
    }).sort({ name: 1 });
  } catch (error) {
    console.error('Error getting root directories:', error);
    return [];
  }
};

// Helper function to get file statistics for a user
export const getUserFileStats = async (userId) => {
  try {
    const stats = await FileSystem.aggregate([
      { $match: { owner: userId } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalSize: { $sum: '$size' }
        }
      }
    ]);

    const result = {
      totalFiles: 0,
      totalFolders: 0,
      totalSize: 0
    };

    stats.forEach(stat => {
      if (stat._id === 'file') {
        result.totalFiles = stat.count;
        result.totalSize = stat.totalSize;
      } else if (stat._id === 'folder') {
        result.totalFolders = stat.count;
      }
    });

    return result;
  } catch (error) {
    console.error('Error getting file stats:', error);
    return { totalFiles: 0, totalFolders: 0, totalSize: 0 };
  }
};

export default {
  createUserDefaultFileSystem,
  initializeUserFileSystem,
  getUserRootDirectories,
  getUserFileStats
};