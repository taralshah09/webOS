// File service for handling file operations across the Web OS
class FileService {
  constructor() {
    this.listeners = new Set();
    this.openFileCallbacks = new Map();
  }

  // Register a callback for opening files
  registerFileOpener(fileType, callback) {
    this.openFileCallbacks.set(fileType, callback);
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

  // Get supported file types
  getSupportedFileTypes() {
    return Array.from(this.openFileCallbacks.keys());
  }

  // Check if a file type is supported
  isFileTypeSupported(fileType) {
    return this.openFileCallbacks.has(fileType);
  }
}

// Create a singleton instance
const fileService = new FileService();

export default fileService; 