import express from 'express';
import fileSystemController from '../controllers/fileSystem.controller.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';
import { initializeUserFileSystem } from '../services/fileSystem.services.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateJWT);

// Get user's complete file system structure
router.get('/', fileSystemController.getFileSystem);

// **NEW: Initialize file system for existing users**
router.post('/initialize', async (req, res) => {
  try {
    const userId = req.userId;
    console.log(`🔄 Initializing file system for user: ${userId}`);
    
    const result = await initializeUserFileSystem(userId);
    
    if (result) {
      res.json({
        success: true,
        message: 'File system initialized successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to initialize file system'
      });
    }
  } catch (error) {
    console.error('Error initializing file system:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initialize file system',
      error: error.message
    });
  }
});

// Search files and folders (must be first to avoid conflicts)
router.get('/search', fileSystemController.searchItems);

// Get contents of a specific directory (using query parameter)
router.get('/directory', (req, res) => {
  const path = req.query.path || '/';
  req.params.path = path;
  fileSystemController.getDirectoryContents(req, res);
});

// Get file content (using query parameter)
router.get('/file', (req, res) => {
  const path = req.query.path;
  if (!path) {
    return res.status(400).json({
      success: false,
      message: 'File path is required as query parameter'
    });
  }
  req.params.path = path;
  fileSystemController.getFileContent(req, res);
});

// Create new folder
router.post('/folder', fileSystemController.createFolder);

// Create new file
router.post('/file', fileSystemController.createFile);

// Update file content (save file) - using POST with action
router.post('/file/save', (req, res) => {
  const path = req.body.filePath;
  if (!path) {
    return res.status(400).json({
      success: false,
      message: 'File path is required in request body as filePath'
    });
  }
  req.params.path = path;
  fileSystemController.updateFileContent(req, res);
});

// Rename file or folder - using POST with action
router.post('/item/rename', (req, res) => {
  const path = req.body.itemPath;
  if (!path) {
    return res.status(400).json({
      success: false,
      message: 'Item path is required in request body as itemPath'
    });
  }
  req.params.path = path;
  fileSystemController.renameItem(req, res);
});

// Delete file or folder - using POST with action
router.post('/item/delete', (req, res) => {
  const path = req.body.itemPath;
  if (!path) {
    return res.status(400).json({
      success: false,
      message: 'Item path is required in request body as itemPath'
    });
  }
  req.params.path = path;
  fileSystemController.deleteItem(req, res);
});

export default router;