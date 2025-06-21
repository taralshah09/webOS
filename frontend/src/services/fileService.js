// Enhanced File service for handling file operations across the Web OS
class FileService {
  constructor() {
    this.listeners = new Set();
    this.openFileCallbacks = new Map();
    this.saveFileCallbacks = new Map();
    this.fileSystemContext = null;

    // Backend API configuration
    this.apiBaseUrl =
      import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  }

  // Get auth token from your auth system
  getAuthToken() {
    // Get token from webos_token in localStorage (your specific key)
    const webosToken = localStorage.getItem('webos_token');
    if (webosToken && webosToken.trim()) {
      return webosToken.trim();
    }

    // Fallback to other possible token keys
    const fallbackKeys = ['token', 'authToken', 'accessToken', 'jwt'];
    for (const key of fallbackKeys) {
      const token = localStorage.getItem(key) || sessionStorage.getItem(key);
      if (token && token.trim()) {
        return token.trim();
      }
    }

    console.error('❌ No authentication token found');
    return null;
  }

  setAuthContext(authContext) {
    this.authContext = authContext;
    console.log('🔐 Auth context set for FileService');
  }

  // **ENHANCED: API call helper with better error handling**
  async apiCall(url, options = {}) {
    const token = this.getAuthToken();
    
    if (!token) {
      throw new Error('Authentication token not found. Please log in again.');
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}${url}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...options.headers,
        },
        ...options,
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          // Clear invalid token
          localStorage.removeItem('webos_token');
          throw new Error('Authentication failed. Please log in again.');
        }
        throw new Error(
          result.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      return result;
    } catch (error) {
      console.error("API call failed:", error);
      throw error;
    }
  }

  // Set file system context for save operations
  setFileSystemContext(context) {
    this.fileSystemContext = context;
    console.log('📁 File system context set for FileService');
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
  openFile(filePath, fileContent) {
    // **NEW: Validate filePath is a string**
    if (typeof filePath !== 'string') {
      console.error('Invalid filePath provided to openFile:', filePath);
      return null;
    }
    
    const extension = filePath.split(".").pop()?.toLowerCase();

    // Map file extensions to file types
    const extensionMap = {
      txt: "text",
      js: "javascript",
      jsx: "javascript",
      ts: "typescript",
      tsx: "typescript",
      html: "html",
      css: "css",
      json: "json",
      md: "markdown",
      py: "python",
      java: "java",
      cpp: "cpp",
      c: "c",
      php: "php",
      rb: "ruby",
      go: "go",
      rs: "rust",
      swift: "swift",
      kt: "kotlin",
      sql: "sql",
      xml: "xml",
      yaml: "yaml",
      yml: "yaml",
    };

    const mappedType = extensionMap[extension] || "text";

    // Notify all listeners about the file opening request
    this.notifyListeners({
      type: "OPEN_FILE",
      filePath,
      fileContent,
      fileType: mappedType,
      extension,
    });

    // Call the appropriate opener if registered
    const opener = this.openFileCallbacks.get(mappedType);
    if (opener) {
      return opener(filePath, fileContent, mappedType);
    }

    // Default to text editor for unknown types
    const textOpener = this.openFileCallbacks.get("text");
    if (textOpener) {
      return textOpener(filePath, fileContent, "text");
    }

    console.warn("No file opener registered for type:", mappedType);
    return null;
  }

  // Load file from backend
  async loadFile(filePath) {
    try {
      this.notifyListeners({
        type: "LOAD_FILE_START",
        filePath,
      });

      const result = await this.apiCall(
        `/filesystem/file?path=${encodeURIComponent(filePath)}`
      );

      this.notifyListeners({
        type: "LOAD_FILE_SUCCESS",
        filePath,
        data: result.data,
      });

      return result.data;
    } catch (error) {
      this.notifyListeners({
        type: "LOAD_FILE_ERROR",
        filePath,
        error: error.message,
      });
      throw error;
    }
  }

  // **NEW: Helper function to safely extract filename and directory**
  _getFileNameAndDir(filePath) {
    if (typeof filePath !== 'string') {
      return { fileName: 'unknown', dirPath: '/' };
    }
    const fileName = filePath.split('/').pop() || 'unknown';
    const dirPath = filePath.split('/').slice(0, -1).join('/') || '/';
    return { fileName, dirPath };
  }

  // **ENHANCED: Save file with proper frontend-backend sync**
  async saveFile(filePath, content) {
    const token = this.getAuthToken();
    if (!token) {
      throw new Error("Please log in to save files");
    }

    try {
      // Notify listeners about save attempt
      this.notifyListeners({
        type: "SAVE_FILE_START",
        filePath,
        content,
      });

      console.log('💾 Saving file to backend:', filePath);

      // **STEP 1: Save to backend API first**
      const response = await fetch(`${this.apiBaseUrl}/filesystem/file/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          filePath: filePath,
          content: content,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to save to backend");
      }

      console.log('✅ Backend save successful:', result);

      // **STEP 2: Update frontend file system context**
      if (this.fileSystemContext) {
        try {
          // Check if file exists in frontend context
          const existingFile = this.fileSystemContext.getItemInfo(filePath);
          
          if (existingFile) {
            // **Update existing file content**
            console.log('📝 Updating existing file in frontend context');
            if (this.fileSystemContext.updateFileContent) {
              this.fileSystemContext.updateFileContent(filePath, content);
            } else if (this.fileSystemContext.saveFile) {
              // Try alternative method name
              const { fileName, dirPath } = this._getFileNameAndDir(filePath);
              await this.fileSystemContext.saveFile(fileName, content, dirPath);
            }
          } else {
            // **Create new file in frontend context**
            console.log('📄 Creating new file in frontend context');
            if (this.fileSystemContext.addFile) {
              // Add file directly with backend result
              const { fileName } = this._getFileNameAndDir(filePath);
              this.fileSystemContext.addFile({
                name: fileName,
                path: filePath,
                content: content,
                type: 'file',
                size: content.length,
                modified: new Date().toISOString(),
                created: new Date().toISOString(),
                extension: filePath.split('.').pop()?.toLowerCase() || '',
                ...result.data
              });
            } else if (this.fileSystemContext.createFile) {
              const { fileName, dirPath } = this._getFileNameAndDir(filePath);
              this.fileSystemContext.createFile(fileName, content, dirPath);
            }
          }
          
        } catch (contextError) {
          console.warn('⚠️ Failed to update frontend file system context:', contextError);
          // Don't fail the save if frontend sync fails
        }
      }

      // Notify listeners about successful save
      this.notifyListeners({
        type: "SAVE_FILE_SUCCESS",
        filePath,
        content,
        result: result.data,
      });

      console.log('✅ File save completed successfully');
      return result.data;

    } catch (error) {
      console.error('❌ File save failed:', error);
      
      // Notify listeners about save error
      this.notifyListeners({
        type: "SAVE_FILE_ERROR",
        filePath,
        content,
        error: error.message,
      });

      throw error;
    }
  }

  // **ENHANCED: Create a new file via backend with frontend sync**
  async createFile(fileName, content = "", dirPath = "/") {
    try {
      this.notifyListeners({
        type: "CREATE_FILE_START",
        fileName,
        dirPath,
      });

      console.log('📄 Creating file in backend:', `${dirPath}/${fileName}`);

      const result = await this.apiCall("/filesystem/file", {
        method: "POST",
        body: JSON.stringify({
          name: fileName,
          content: content,
          parentPath: dirPath,
        }),
      });

      const filePath = `${dirPath}/${fileName}`.replace("//", "/");

      console.log('✅ Backend file creation successful:', result);

      // **Update frontend file system context**
      if (this.fileSystemContext && this.fileSystemContext.addFile) {
        try {
          this.fileSystemContext.addFile({
            name: fileName,
            path: filePath,
            content: content,
            type: 'file',
            size: content.length,
            modified: new Date().toISOString(),
            created: new Date().toISOString(),
            extension: fileName.split('.').pop()?.toLowerCase() || '',
            ...result.data
          });
          console.log('📄 Frontend context updated via addFile');
        } catch (contextError) {
          console.warn('⚠️ Failed to update frontend file system context:', contextError);
        }
      }

      this.notifyListeners({
        type: "FILE_CREATED",
        filePath,
        content,
        result: result.data,
      });

      return result.data;
    } catch (error) {
      this.notifyListeners({
        type: "FILE_CREATE_ERROR",
        fileName,
        dirPath,
        error: error.message,
      });

      throw error;
    }
  }

  // Read file content from backend or cache
  async readFile(filePath) {
    try {
      // Try file system context first (for performance)
      if (this.fileSystemContext) {
        const fileInfo = this.fileSystemContext.getItemInfo(filePath);
        if (fileInfo && fileInfo.content !== undefined) {
          return fileInfo.content;
        }
      }

      // Fallback to backend API
      const fileData = await this.loadFile(filePath);
      return fileData.content || "";
    } catch (error) {
      console.error("Error reading file:", error);
      return "";
    }
  }

  // **ENHANCED: Delete file with frontend sync**
  async deleteFile(filePath) {
    try {
      console.log('🗑️ Deleting file from backend:', filePath);

      const result = await this.apiCall("/filesystem/item/delete", {
        method: "POST",
        body: JSON.stringify({
          itemPath: filePath,
        }),
      });

      console.log('✅ Backend deletion successful');

      // **Update frontend file system context**
      if (this.fileSystemContext && this.fileSystemContext.deleteItems) {
        try {
          this.fileSystemContext.deleteItems([filePath]);
          console.log('🗑️ Frontend context updated via deleteItems');
        } catch (contextError) {
          console.warn('⚠️ Failed to update frontend file system context:', contextError);
        }
      }

      this.notifyListeners({
        type: "FILE_DELETED",
        filePath,
        result,
      });

      return result;
    } catch (error) {
      this.notifyListeners({
        type: "FILE_DELETE_ERROR",
        filePath,
        error: error.message,
      });
      throw error;
    }
  }

  // **ENHANCED: Rename file with frontend sync**
  async renameFile(filePath, newName) {
    try {
      console.log('✏️ Renaming file in backend:', filePath, '→', newName);

      const result = await this.apiCall("/filesystem/item/rename", {
        method: "POST",
        body: JSON.stringify({
          itemPath: filePath,
          newName: newName,
        }),
      });

      console.log('✅ Backend rename successful:', result);

      // **Update frontend file system context**
      if (this.fileSystemContext && this.fileSystemContext.renameItem) {
        try {
          this.fileSystemContext.renameItem(filePath, newName);
          console.log('✏️ Frontend context updated via renameItem');
        } catch (contextError) {
          console.warn('⚠️ Failed to update frontend file system context:', contextError);
        }
      }

      this.notifyListeners({
        type: "FILE_RENAMED",
        oldPath: filePath,
        newPath: result.data.path,
        result: result.data,
      });

      return result.data;
    } catch (error) {
      this.notifyListeners({
        type: "FILE_RENAME_ERROR",
        filePath,
        newName,
        error: error.message,
      });
      throw error;
    }
  }

  async searchFiles(query, type = null) {
    try {
      let url = `/filesystem/search?query=${encodeURIComponent(query)}`;
      if (type) {
        url += `&type=${type}`;
      }

      const result = await this.apiCall(url);
      return result.data;
    } catch (error) {
      console.error("Error searching files:", error);
      throw error;
    }
  }

  // Add a listener for file events
  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // Notify all listeners
  notifyListeners(event) {
    this.listeners.forEach((callback) => {
      try {
        callback(event);
      } catch (error) {
        console.error("Error in file service listener:", error);
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
      "txt",
      "js",
      "jsx",
      "ts",
      "tsx",
      "html",
      "css",
      "json",
      "md",
      "py",
      "java",
      "cpp",
      "c",
      "php",
      "rb",
      "go",
      "rs",
      "swift",
      "kt",
      "sql",
      "xml",
      "yaml",
      "yml",
      "log",
      "config",
      "env",
    ];
  }

  // Check if a file is editable based on its extension
  isFileEditable(filePath) {
    // **NEW: Validate filePath is a string**
    if (typeof filePath !== 'string') {
      console.warn('Invalid filePath provided to isFileEditable:', filePath);
      return false;
    }
    
    const extension = filePath.split(".").pop()?.toLowerCase();
    return this.getEditableExtensions().includes(extension);
  }
}

// Create a singleton instance
const fileService = new FileService();

export default fileService;