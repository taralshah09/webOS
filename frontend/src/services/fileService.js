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
    // Adjust this based on your auth implementation
    return (
      localStorage.getItem("token") || sessionStorage.getItem("token") || ""
    );
  }

  setAuthContext(authContext) {
    this.authContext = authContext;
  }

  // API call helper
  async apiCall(url, options = {}) {
    const token = localStorage.getItem("webos_token");

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

  // **NEW: Load file from backend**
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

  // **ENHANCED: Save a file to the backend**
  async saveFile(filePath, content, options = {}) {
    const token = localStorage.getItem("webos_token");
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

      // **CORRECTED: Make direct API call with proper Authorization header**
      const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const response = await fetch(`${apiBaseUrl}/filesystem/file/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // **FIX: Actually use the token in headers**
        },
        body: JSON.stringify({
          filePath: filePath,
          content: content,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Save failed");
      }

      // Notify listeners about successful save
      this.notifyListeners({
        type: "SAVE_FILE_SUCCESS",
        filePath,
        content,
        result: result.data,
      });

      // Update file system context if available (for UI updates)
      if (this.fileSystemContext && this.fileSystemContext.updateFileContent) {
        try {
          this.fileSystemContext.updateFileContent(filePath, content);
        } catch (contextError) {
          console.warn("Failed to update file system context:", contextError);
        }
      }

      return result.data;
    } catch (error) {
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
  // **NEW: Create a new file via backend**
  async createFile(fileName, content = "", dirPath = "/") {
    try {
      this.notifyListeners({
        type: "CREATE_FILE_START",
        fileName,
        dirPath,
      });

      const result = await this.apiCall("/filesystem/file", {
        method: "POST",
        body: JSON.stringify({
          name: fileName,
          content: content,
          parentPath: dirPath,
        }),
      });

      const filePath = `${dirPath}/${fileName}`.replace("//", "/");

      this.notifyListeners({
        type: "FILE_CREATED",
        filePath,
        content,
        result: result.data,
      });

      // Update file system context if available
      if (this.fileSystemContext && this.fileSystemContext.addFile) {
        try {
          this.fileSystemContext.addFile(result.data);
        } catch (contextError) {
          console.warn("Failed to update file system context:", contextError);
        }
      }

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

  // **ENHANCED: Read file content from backend or cache**
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

  // **NEW: Additional backend operations**
  async deleteFile(filePath) {
    try {
      const result = await this.apiCall("/filesystem/item/delete", {
        method: "POST",
        body: JSON.stringify({
          itemPath: filePath,
        }),
      });

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

  async renameFile(filePath, newName) {
    try {
      const result = await this.apiCall("/filesystem/item/rename", {
        method: "POST",
        body: JSON.stringify({
          itemPath: filePath,
          newName: newName,
        }),
      });

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
    const extension = filePath.split(".").pop()?.toLowerCase();
    return this.getEditableExtensions().includes(extension);
  }
}

// Create a singleton instance
const fileService = new FileService();

export default fileService;
