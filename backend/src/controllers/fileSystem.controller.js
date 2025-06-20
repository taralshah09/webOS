import { FileSystem } from '../models/fileSystem.models.js';
import mongoose from 'mongoose';

// Helper function to build hierarchical file system tree
const buildFileSystemTree = (items) => {
  const tree = {};
  const itemMap = new Map();

  // First pass: create map of all items
  items.forEach(item => {
    const itemData = {
      _id: item._id,
      name: item.name,
      type: item.type,
      path: item.path,
      content: item.content || '',
      size: item.size || 0,
      mimeType: item.mimeType,
      extension: item.name.includes('.') ? item.name.split('.').pop().toLowerCase() : '',
      children: [],
      permissions: item.permissions,
      metadata: item.metadata,
      created: item.createdAt,
      modified: item.updatedAt
    };
    
    itemMap.set(item._id.toString(), itemData);
    tree[item.path] = itemData;
  });

  // Second pass: build parent-child relationships
  items.forEach(item => {
    if (item.parent) {
      const parent = itemMap.get(item.parent.toString());
      const child = itemMap.get(item._id.toString());
      if (parent && child) {
        parent.children.push(child.path);
      }
    }
  });

  return tree;
};

// Helper function to get MIME type based on file extension
const getMimeType = (filename) => {
  const ext = filename.split('.').pop()?.toLowerCase();
  const mimeTypes = {
    'txt': 'text/plain',
    'js': 'application/javascript',
    'jsx': 'application/javascript',
    'ts': 'application/typescript',
    'tsx': 'application/typescript',
    'html': 'text/html',
    'css': 'text/css',
    'json': 'application/json',
    'md': 'text/markdown',
    'py': 'text/x-python',
    'java': 'text/x-java',
    'cpp': 'text/x-c++src',
    'c': 'text/x-csrc',
    'php': 'text/x-php',
    'rb': 'text/x-ruby',
    'go': 'text/x-go',
    'rs': 'text/x-rust',
    'swift': 'text/x-swift',
    'kt': 'text/x-kotlin',
    'sql': 'application/sql',
    'xml': 'application/xml',
    'yaml': 'application/x-yaml',
    'yml': 'application/x-yaml'
  };
  return mimeTypes[ext] || 'text/plain';
};

export const fileSystemController = {
  // Get user's complete file system structure
  getFileSystem: async (req, res) => {
    try {
      const userId = req.userId;
      
      // Get all files and folders for the user
      const fileSystemItems = await FileSystem.find({ owner: userId })
        .populate('children')
        .sort({ type: -1, name: 1 }); // Folders first, then files, sorted by name

      // Build hierarchical structure
      const fileSystemTree = buildFileSystemTree(fileSystemItems);
      
      res.json({
        success: true,
        data: {
          fileSystem: fileSystemTree,
          totalItems: fileSystemItems.length
        }
      });
    } catch (error) {
      console.error('Error getting file system:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve file system',
        error: error.message
      });
    }
  },

  // Get contents of a specific directory
  getDirectoryContents: async (req, res) => {
    try {
      const userId = req.userId;
      const { path } = req.params;
      
      // Find the directory
      const directory = await FileSystem.findOne({
        owner: userId,
        path: path,
        type: 'folder'
      });

      if (!directory) {
        return res.status(404).json({
          success: false,
          message: 'Directory not found'
        });
      }

      // Get children
      const children = await FileSystem.find({
        owner: userId,
        parent: directory._id
      }).sort({ type: -1, name: 1 });

      res.json({
        success: true,
        data: {
          directory: {
            _id: directory._id,
            name: directory.name,
            path: directory.path,
            type: directory.type
          },
          contents: children.map(item => ({
            _id: item._id,
            name: item.name,
            type: item.type,
            path: item.path,
            size: item.size,
            extension: item.name.includes('.') ? item.name.split('.').pop().toLowerCase() : '',
            mimeType: item.mimeType,
            created: item.createdAt,
            modified: item.updatedAt,
            permissions: item.permissions
          }))
        }
      });
    } catch (error) {
      console.error('Error getting directory contents:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get directory contents',
        error: error.message
      });
    }
  },

  // Get file content
  getFileContent: async (req, res) => {
    try {
      const userId = req.userId;
      const { path } = req.params;

      const file = await FileSystem.findOne({
        owner: userId,
        path: path,
        type: 'file'
      });

      if (!file) {
        return res.status(404).json({
          success: false,
          message: 'File not found'
        });
      }

      // Update accessed time
      file.metadata.accessed = new Date();
      await file.save();

      res.json({
        success: true,
        data: {
          _id: file._id,
          name: file.name,
          path: file.path,
          content: file.content,
          size: file.size,
          mimeType: file.mimeType,
          extension: file.name.includes('.') ? file.name.split('.').pop().toLowerCase() : '',
          created: file.createdAt,
          modified: file.updatedAt,
          accessed: file.metadata.accessed
        }
      });
    } catch (error) {
      console.error('Error getting file content:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get file content',
        error: error.message
      });
    }
  },

  // Create new folder
  createFolder: async (req, res) => {
    try {
      const userId = req.userId;
      const { name, parentPath = '/' } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Folder name is required'
        });
      }

      // Find parent folder
      let parent = null;
      if (parentPath !== '/') {
        parent = await FileSystem.findOne({
          owner: userId,
          path: parentPath,
          type: 'folder'
        });

        if (!parent) {
          return res.status(404).json({
            success: false,
            message: 'Parent folder not found'
          });
        }
      }

      const folderPath = parentPath === '/' ? `/${name}` : `${parentPath}/${name}`;

      // Check if folder already exists
      const existingFolder = await FileSystem.findOne({
        owner: userId,
        path: folderPath
      });

      if (existingFolder) {
        return res.status(409).json({
          success: false,
          message: 'Folder already exists'
        });
      }

      // Create new folder
      const newFolder = await FileSystem.create({
        name: name.trim(),
        type: 'folder',
        owner: userId,
        parent: parent?._id,
        path: folderPath,
        permissions: {
          read: true,
          write: true,
          execute: true
        }
      });

      // Update parent's children array
      if (parent) {
        parent.children.push(newFolder._id);
        await parent.save();
      }

      res.status(201).json({
        success: true,
        data: {
          _id: newFolder._id,
          name: newFolder.name,
          type: newFolder.type,
          path: newFolder.path,
          created: newFolder.createdAt,
          modified: newFolder.updatedAt
        },
        message: 'Folder created successfully'
      });
    } catch (error) {
      console.error('Error creating folder:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create folder',
        error: error.message
      });
    }
  },

  // Create new file
  createFile: async (req, res) => {
    try {
      const userId = req.userId;
      const { name, content = '', parentPath = '/' } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: 'File name is required'
        });
      }

      // Find parent folder
      let parent = null;
      if (parentPath !== '/') {
        parent = await FileSystem.findOne({
          owner: userId,
          path: parentPath,
          type: 'folder'
        });

        if (!parent) {
          return res.status(404).json({
            success: false,
            message: 'Parent folder not found'
          });
        }
      }

      const filePath = parentPath === '/' ? `/${name}` : `${parentPath}/${name}`;

      // Check if file already exists
      const existingFile = await FileSystem.findOne({
        owner: userId,
        path: filePath
      });

      if (existingFile) {
        return res.status(409).json({
          success: false,
          message: 'File already exists'
        });
      }

      // Create new file
      const newFile = await FileSystem.create({
        name: name.trim(),
        type: 'file',
        owner: userId,
        parent: parent?._id,
        path: filePath,
        content: content,
        mimeType: getMimeType(name),
        size: Buffer.byteLength(content, 'utf8'),
        permissions: {
          read: true,
          write: true,
          execute: false
        }
      });

      // Update parent's children array
      if (parent) {
        parent.children.push(newFile._id);
        await parent.save();
      }

      res.status(201).json({
        success: true,
        data: {
          _id: newFile._id,
          name: newFile.name,
          type: newFile.type,
          path: newFile.path,
          content: newFile.content,
          size: newFile.size,
          mimeType: newFile.mimeType,
          extension: newFile.name.includes('.') ? newFile.name.split('.').pop().toLowerCase() : '',
          created: newFile.createdAt,
          modified: newFile.updatedAt
        },
        message: 'File created successfully'
      });
    } catch (error) {
      console.error('Error creating file:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create file',
        error: error.message
      });
    }
  },

  // Update file content (save file)
  updateFileContent: async (req, res) => {
    try {
      const userId = req.userId;
      const { path } = req.params;
      const { content } = req.body;

      if (content === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Content is required'
        });
      }

      const file = await FileSystem.findOne({
        owner: userId,
        path: path,
        type: 'file'
      });

      if (!file) {
        return res.status(404).json({
          success: false,
          message: 'File not found'
        });
      }

      // Check write permissions
      if (!file.permissions.write) {
        return res.status(403).json({
          success: false,
          message: 'No write permission for this file'
        });
      }

      // Update file content
      file.content = content;
      file.size = Buffer.byteLength(content, 'utf8');
      file.metadata.modified = new Date();
      
      await file.save();

      res.json({
        success: true,
        data: {
          _id: file._id,
          name: file.name,
          path: file.path,
          content: file.content,
          size: file.size,
          modified: file.updatedAt
        },
        message: 'File updated successfully'
      });
    } catch (error) {
      console.error('Error updating file:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update file',
        error: error.message
      });
    }
  },

  // Rename file or folder
  renameItem: async (req, res) => {
    try {
      const userId = req.userId;
      const { path } = req.params;
      const { newName } = req.body;

      if (!newName || !newName.trim()) {
        return res.status(400).json({
          success: false,
          message: 'New name is required'
        });
      }

      const item = await FileSystem.findOne({
        owner: userId,
        path: path
      });

      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Item not found'
        });
      }

      // Build new path
      const pathParts = path.split('/');
      pathParts[pathParts.length - 1] = newName.trim();
      const newPath = pathParts.join('/');

      // Check if item with new name already exists
      const existingItem = await FileSystem.findOne({
        owner: userId,
        path: newPath
      });

      if (existingItem) {
        return res.status(409).json({
          success: false,
          message: 'Item with this name already exists'
        });
      }

      // Update item
      item.name = newName.trim();
      item.path = newPath;
      if (item.type === 'file') {
        item.mimeType = getMimeType(newName);
      }
      
      await item.save();

      // If it's a folder, update all children paths recursively
      if (item.type === 'folder') {
        await updateChildrenPaths(userId, path, newPath);
      }

      res.json({
        success: true,
        data: {
          _id: item._id,
          name: item.name,
          path: item.path,
          type: item.type,
          modified: item.updatedAt
        },
        message: 'Item renamed successfully'
      });
    } catch (error) {
      console.error('Error renaming item:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to rename item',
        error: error.message
      });
    }
  },

  // Delete file or folder
  deleteItem: async (req, res) => {
    try {
      const userId = req.userId;
      const { path } = req.params;

      const item = await FileSystem.findOne({
        owner: userId,
        path: path
      });

      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Item not found'
        });
      }

      // If it's a folder, delete all children recursively
      if (item.type === 'folder') {
        await deleteChildrenRecursively(userId, item._id);
      }

      // Remove from parent's children array
      if (item.parent) {
        await FileSystem.findByIdAndUpdate(
          item.parent,
          { $pull: { children: item._id } }
        );
      }

      // Delete the item
      await FileSystem.findByIdAndDelete(item._id);

      res.json({
        success: true,
        message: 'Item deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting item:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete item',
        error: error.message
      });
    }
  },

  // Search files and folders
  searchItems: async (req, res) => {
    try {
      const userId = req.userId;
      const { query, type } = req.query;

      if (!query || query.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Search query must be at least 2 characters'
        });
      }

      const searchFilter = {
        owner: userId,
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { content: { $regex: query, $options: 'i' } }
        ]
      };

      if (type && ['file', 'folder'].includes(type)) {
        searchFilter.type = type;
      }

      const results = await FileSystem.find(searchFilter)
        .select('name type path size mimeType createdAt updatedAt')
        .sort({ type: -1, name: 1 })
        .limit(50);

      res.json({
        success: true,
        data: {
          results: results.map(item => ({
            _id: item._id,
            name: item.name,
            type: item.type,
            path: item.path,
            size: item.size,
            extension: item.name.includes('.') ? item.name.split('.').pop().toLowerCase() : '',
            mimeType: item.mimeType,
            created: item.createdAt,
            modified: item.updatedAt
          })),
          total: results.length,
          query: query
        }
      });
    } catch (error) {
      console.error('Error searching items:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search items',
        error: error.message
      });
    }
  }
};

// Helper function to update children paths recursively
const updateChildrenPaths = async (userId, oldBasePath, newBasePath) => {
  const children = await FileSystem.find({
    owner: userId,
    path: { $regex: `^${oldBasePath}/` }
  });

  for (const child of children) {
    child.path = child.path.replace(oldBasePath, newBasePath);
    await child.save();
  }
};

// Helper function to delete children recursively
const deleteChildrenRecursively = async (userId, parentId) => {
  const children = await FileSystem.find({
    owner: userId,
    parent: parentId
  });

  for (const child of children) {
    if (child.type === 'folder') {
      await deleteChildrenRecursively(userId, child._id);
    }
    await FileSystem.findByIdAndDelete(child._id);
  }
};

export default fileSystemController;