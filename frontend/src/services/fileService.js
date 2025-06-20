// Enhanced File service for handling file operations across the Web OS
class FileService {
  constructor() {
    this.listeners = new Set();
    this.openFileCallbacks = new Map();
    this.saveFileCallbacks = new Map();
    this.fileSystemContext = null;
  }

  // Set file system context for save operations
  setFileSystemContext(context) {
    this.fileSystemContext = context;
  }

  // Register a callback for opening files
  registerFileOpener(fileType, callback) {
    this.openFileCallbacks.set(fileType, callback);
    
    // Return unregister function
    return () => {
      this.openFileCallbacks.delete(fileType);
    };
  }

  // Register a callback for saving files
  registerFileSaver(fileType, callback) {
    this.saveFileCallbacks.set(fileType, callback);
    
    // Return unregister function
    return () => {
      this.saveFileCallbacks.delete(fileType);
    };
  }

  // Open a file with the appropriate application
  openFile(filePath, fileContent, fileType) {
    const extension = filePath.split('.').pop()?.toLowerCase();
    
    // Map file extensions to file types
    const extensionMap = {
      'txt': 'text',
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'html': 'html',
      'css': 'css',
      'json': 'json',
      'md': 'markdown',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'php': 'php',
      'rb': 'ruby',
      'go': 'go',
      'rs': 'rust',
      'swift': 'swift',
      'kt': 'kotlin',
      'sql': 'sql',
      'xml': 'xml',
      'yaml': 'yaml',
      'yml': 'yaml'
    };

    const mappedType = extensionMap[extension] || 'text';
    
    // Notify all listeners about the file opening request
    this.notifyListeners({
      type: 'OPEN_FILE',
      filePath,
      fileContent,
      fileType: mappedType,
      extension
    });

    // Call the appropriate opener if registered
    const opener = this.openFileCallbacks.get(mappedType);
    if (opener) {
      return opener(filePath, fileContent, mappedType);
    }

    // Default to text editor for unknown types
    const textOpener = this.openFileCallbacks.get('text');
    if (textOpener) {
      return textOpener(filePath, fileContent, 'text');
    }

    console.warn('No file opener registered for type:', mappedType);
    return null;
  }

  // Save a file to the file system
  async saveFile(filePath, content, options = {}) {
    try {
      // Notify listeners about save attempt
      this.notifyListeners({
        type: 'SAVE_FILE_START',
        filePath,
        content
      });

      // Use file system context to save the file
      if (this.fileSystemContext) {
        // Extract directory and filename
        const pathParts = filePath.split('/');
        const fileName = pathParts.pop();
        const dirPath = pathParts.join('/') || '/';

        // Save using the file system context
        const result = await this.fileSystemContext.saveFile(fileName, content, dirPath);
        
        // Notify listeners about successful save
        this.notifyListeners({
          type: 'SAVE_FILE_SUCCESS',
          filePath,
          content,
          result
        });

        return result;
      } else {
        throw new Error('File system context not available');
      }
    } catch (error) {
      // Notify listeners about save error
      this.notifyListeners({
        type: 'SAVE_FILE_ERROR',
        filePath,
        content,
        error: error.message
      });
      
      throw error;
    }
  }

  // Create a new file
  async createFile(fileName, content = '', dirPath = '/') {
    try {
      if (this.fileSystemContext) {
        const result = await this.fileSystemContext.createFile(fileName, content, dirPath);
        
        this.notifyListeners({
          type: 'FILE_CREATED',
          filePath: `${dirPath}/${fileName}`.replace('//', '/'),
          content,
          result
        });

        return result;
      } else {
        throw new Error('File system context not available');
      }
    } catch (error) {
      this.notifyListeners({
        type: 'FILE_CREATE_ERROR',
        fileName,
        dirPath,
        error: error.message
      });
      
      throw error;
    }
  }

  // Read file content from file system
  async readFile(filePath) {
    try {
      if (this.fileSystemContext) {
        const fileInfo = this.fileSystemContext.getItemInfo(filePath);
        return fileInfo ? fileInfo.content || '' : '';
      }
      return '';
    } catch (error) {
      console.error('Error reading file:', error);
      return '';
    }
  }

  // Add a listener for file events
  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // Notify all listeners
  notifyListeners(event) {
    this.listeners.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('Error in file service listener:', error);
      }
    });
  }

  // Get supported file types for opening
  getSupportedFileTypes() {
    return Array.from(this.openFileCallbacks.keys());
  }

  // Check if a file type is supported for opening
  isFileTypeSupported(fileType) {
    return this.openFileCallbacks.has(fileType);
  }

  // Get list of text-editable file extensions
  getEditableExtensions() {
    return [
      'txt', 'js', 'jsx', 'ts', 'tsx', 'html', 'css', 'json', 'md',
      'py', 'java', 'cpp', 'c', 'php', 'rb', 'go', 'rs', 'swift',
      'kt', 'sql', 'xml', 'yaml', 'yml', 'log', 'config', 'env'
    ];
  }

  // Check if a file is editable based on its extension
  isFileEditable(filePath) {
    const extension = filePath.split('.').pop()?.toLowerCase();
    return this.getEditableExtensions().includes(extension);
  }
}

// Create a singleton instance
const fileService = new FileService();

export default fileService;