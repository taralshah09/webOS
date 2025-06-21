import React, { useState, useRef, useEffect, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import fileService from '../../services/fileService';
import { useFileSystem } from '../../contexts/FileSystemContext';
import { useAuth } from '../../contexts/AuthContext'; // ADD THIS IMPORT
import './Notepad.css';

const Notepad = ({ initialContent, initialFilePath, initialLanguage, onTitleChange }) => {
  const fileSystemContext = useFileSystem();
  const authContext = useAuth(); // ADD THIS LINE
  
  const [content, setContent] = useState(initialContent || `Welcome to Web OS Notepad!

This is a professional text editor powered by Monaco Editor - the same editor used in Visual Studio Code.

Features:
• Syntax highlighting for multiple languages
• Line numbers and minimap
• Auto-completion and IntelliSense
• Multiple themes and customization options
• Professional editing experience
• Integrated file system save/load
• **Auto-save functionality** - saves automatically after 2 seconds of inactivity
• **Backend integration** - files are saved to the database

You can:  
- Type and edit text with advanced features
- Save files directly to the file system (Ctrl+S)
- Files auto-save after 2 seconds of inactivity
- Open files from File Explorer
- Resize this window
- Move it around the desktop
- Minimize, maximize, and close it
- Enjoy a real development environment

Try changing the language mode in the bottom status bar!`);

  const [language, setLanguage] = useState(initialLanguage || 'plaintext');
  const [theme, setTheme] = useState('vs-dark');
  const [fontSize, setFontSize] = useState(14);
  const [currentFilePath, setCurrentFilePath] = useState(initialFilePath || null);
  const [isModified, setIsModified] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [lastSaveTime, setLastSaveTime] = useState(null);
  const [isMounted, setIsMounted] = useState(true);
  
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const autoSaveTimeoutRef = useRef(null);
  const AUTOSAVE_DELAY = 2000;
  
  const editorRef = useRef(null);
  const unregistersRef = useRef([]);

  // **NEW: Set auth context in file service**
  useEffect(() => {
    fileService.setFileSystemContext(fileSystemContext);
    fileService.setAuthContext(authContext); // ADD THIS LINE
    
    // Debug authentication status
    console.log('🔐 Notepad Auth Status:', {
      isAuthenticated: authContext.isAuthenticated(),
      hasToken: !!authContext.token,
      tokenPreview: authContext.token ? authContext.token.substring(0, 20) + '...' : 'none'
    });
  }, [fileSystemContext, authContext]);

  // Update window title when file changes
  useEffect(() => {
    if (onTitleChange) {
      const fileName = currentFilePath ? currentFilePath.split('/').pop() : 'Untitled';
      const modified = isModified ? '● ' : '';
      onTitleChange(`${modified}${fileName} - Notepad`);
    }
  }, [currentFilePath, isModified, onTitleChange]);

  // Set initial state if props are provided
  useEffect(() => {
    if (initialContent !== undefined) {
      setContent(initialContent);
    }
    if (initialFilePath !== undefined) {
      setCurrentFilePath(initialFilePath);
    }
    if (initialLanguage !== undefined) {
      setLanguage(initialLanguage);
    }
  }, [initialContent, initialFilePath, initialLanguage]);

  // Auto-save functionality
  const scheduleAutoSave = useCallback(() => {
    if (!autoSaveEnabled || !currentFilePath || isSaving) {
      return;
    }

    // Check authentication before scheduling auto-save
    if (!authContext.isAuthenticated()) {
      console.warn('🔐 Auto-save skipped: not authenticated');
      setSaveStatus('⚠️ Not authenticated - auto-save disabled');
      return;
    }

    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(async () => {
      if (isMounted && isModified && currentFilePath && !isSaving) {
        try {
          console.log('Auto-saving file:', currentFilePath);
          await handleSave(true);
        } catch (error) {
          console.error('Auto-save failed:', error);
        }
      }
    }, AUTOSAVE_DELAY);
  }, [autoSaveEnabled, currentFilePath, isSaving, isModified, isMounted, authContext]);

  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  // Stable callback for opening files
  const openFileInEditor = useCallback((filePath, fileContent, fileType) => {
    if (!isMounted) return;
    
    setContent(fileContent || '');
    setCurrentFilePath(filePath);
    setIsModified(false);
    setSaveStatus('');
    setLastSaveTime(new Date());
    
    const languageMap = {
      'javascript': 'javascript', 'typescript': 'typescript',
      'html': 'html', 'css': 'css', 'json': 'json',
      'markdown': 'markdown', 'python': 'python',
      'java': 'java', 'cpp': 'cpp', 'c': 'c',
      'php': 'php', 'ruby': 'ruby', 'go': 'go',
      'rust': 'rust', 'swift': 'swift', 'kotlin': 'kotlin',
      'sql': 'sql', 'xml': 'xml', 'yaml': 'yaml', 'text': 'plaintext'
    };
    
    setLanguage(languageMap[fileType] || 'plaintext');
  }, [isMounted]);

  // Register with file service
  useEffect(() => {
    const unregisters = [];
    
    try {
      unregisters.push(fileService.registerFileOpener('text', openFileInEditor));

      const supportedTypes = [
        'javascript', 'typescript', 'html', 'css', 'json', 'markdown',
        'python', 'java', 'cpp', 'c', 'php', 'ruby', 'go', 'rust',
        'swift', 'kotlin', 'sql', 'xml', 'yaml'
      ];

      supportedTypes.forEach(type => {
        unregisters.push(fileService.registerFileOpener(type, openFileInEditor));
      });

      unregistersRef.current = unregisters;
    } catch (error) {
      console.warn('Error registering file openers:', error);
    }

    return () => {
      unregistersRef.current.forEach(unregister => {
        try {
          if (typeof unregister === 'function') {
            unregister();
          }
        } catch (error) {
          console.warn('Error unregistering file opener:', error);
        }
      });
      unregistersRef.current = [];
    };
  }, [openFileInEditor]);

  // **ENHANCED: Listen for file service events with auth checking**
  useEffect(() => {
    const unsubscribe = fileService.addListener((event) => {
      if (!isMounted) return;

      switch (event.type) {
        case 'SAVE_FILE_START':
          if (event.filePath === currentFilePath) {
            setIsSaving(true);
            setSaveStatus('💾 Saving...');
          }
          break;
          
        case 'SAVE_FILE_SUCCESS':
          if (event.filePath === currentFilePath) {
            setIsModified(false);
            setIsSaving(false);
            setLastSaveTime(new Date());
            setSaveStatus('✅ Saved successfully');
            setTimeout(() => setSaveStatus(''), 3000);
          }
          break;
          
        case 'SAVE_FILE_ERROR':
          if (event.filePath === currentFilePath) {
            setIsSaving(false);
            if (event.error.includes('Authentication') || event.error.includes('token')) {
              setSaveStatus('🔐 Authentication required - please log in');
              setAutoSaveEnabled(false); // Disable auto-save if auth fails
            } else {
              setSaveStatus(`❌ Save failed: ${event.error}`);
            }
            setTimeout(() => setSaveStatus(''), 5000);
          }
          break;

        case 'LOAD_FILE_START':
          setSaveStatus('📂 Loading...');
          break;

        case 'LOAD_FILE_SUCCESS':
          setSaveStatus('✅ File loaded');
          setTimeout(() => setSaveStatus(''), 2000);
          break;

        case 'LOAD_FILE_ERROR':
          setSaveStatus(`❌ Load failed: ${event.error}`);
          setTimeout(() => setSaveStatus(''), 5000);
          break;
      }
    });

    return unsubscribe;
  }, [isMounted, currentFilePath]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setIsMounted(false);
      
      if (editorRef.current) {
        try {
          editorRef.current.dispose();
        } catch (error) {
          console.warn('Error disposing Monaco editor:', error);
        }
      }
    };
  }, []);

  const handleEditorDidMount = useCallback((editor) => {
    editorRef.current = editor;
    
    editor.addCommand(window.monaco.KeyMod.CtrlCmd | window.monaco.KeyCode.KeyS, () => {
      handleSave();
    });

    editor.addCommand(window.monaco.KeyMod.CtrlCmd | window.monaco.KeyMod.Shift | window.monaco.KeyCode.KeyS, () => {
      handleSaveAs();
    });

    editor.addCommand(window.monaco.KeyMod.CtrlCmd | window.monaco.KeyCode.KeyO, () => {
      handleOpen();
    });

    try {
      editor.onDidDispose(() => {
        editorRef.current = null;
      });
    } catch (error) {
      console.warn('Error setting up editor dispose handler:', error);
    }
  }, []);

  const handleEditorChange = useCallback((value) => {
    if (!isMounted) return;
    
    setContent(value || '');
    setIsModified(true);
    setSaveStatus('');
    
    if (currentFilePath) {
      scheduleAutoSave();
    }
  }, [isMounted, currentFilePath, scheduleAutoSave]);

  const handleLanguageChange = useCallback((e) => {
    if (!isMounted) return;
    setLanguage(e.target.value);
  }, [isMounted]);

  const handleThemeChange = useCallback((e) => {
    if (!isMounted) return;
    setTheme(e.target.value);
  }, [isMounted]);

  const handleFontSizeChange = useCallback((e) => {
    if (!isMounted) return;
    setFontSize(parseInt(e.target.value));
  }, [isMounted]);

  const handleNewFile = useCallback(() => {
    if (!isMounted) return;
    
    if (isModified) {
      const save = window.confirm('Do you want to save the current file before creating a new one?');
      if (save) {
        handleSave();
      }
    }
    
    setContent('');
    setCurrentFilePath(null);
    setIsModified(false);
    setLanguage('plaintext');
    setSaveStatus('');
    setLastSaveTime(null);
  }, [isMounted, isModified]);

  // **ENHANCED: Save function with auth checking**
  const handleSave = useCallback(async (isAutoSave = false) => {
    if (!isMounted) return;

    // Check authentication first
    if (!authContext.isAuthenticated()) {
      const errorMsg = '🔐 Please log in to save files';
      setSaveStatus(errorMsg);
      if (!isAutoSave) {
        alert('You need to be logged in to save files. Please log in and try again.');
      }
      setTimeout(() => setSaveStatus(''), 5000);
      return;
    }
    
    if (currentFilePath) {
      try {
        if (!isAutoSave) {
          setIsSaving(true);
          setSaveStatus('💾 Saving...');
        }
        
        await fileService.saveFile(currentFilePath, content);
        
        if (isAutoSave) {
          console.log('Auto-saved successfully:', currentFilePath);
        }
      } catch (error) {
        console.error('Error saving file:', error);
        if (!isAutoSave) {
          setSaveStatus(`❌ Save failed: ${error.message}`);
          setTimeout(() => setSaveStatus(''), 5000);
          setIsSaving(false);
        }
      }
    } else {
      if (!isAutoSave) {
        handleSaveAs();
      }
    }
  }, [isMounted, currentFilePath, content, authContext]);

  const handleSaveAs = useCallback(async () => {
    if (!isMounted) return;

    // Check authentication first
    if (!authContext.isAuthenticated()) {
      alert('You need to be logged in to save files. Please log in and try again.');
      return;
    }
    
    const fileName = prompt('Enter file name:', currentFilePath ? currentFilePath.split('/').pop() : 'document.txt');
    if (!fileName || !fileName.trim()) return;
    
    try {
      setIsSaving(true);
      setSaveStatus('💾 Saving...');
      
      const dirPath = currentFilePath ? currentFilePath.split('/').slice(0, -1).join('/') || '/' : '/Documents';
      const newFilePath = `${dirPath}/${fileName.trim()}`.replace('//', '/');
      
      await fileService.saveFile(newFilePath, content);
      setCurrentFilePath(newFilePath);
      
      const extension = fileName.split('.').pop()?.toLowerCase();
      const languageMap = {
        'js': 'javascript', 'jsx': 'javascript', 'ts': 'typescript', 'tsx': 'typescript',
        'html': 'html', 'css': 'css', 'json': 'json', 'md': 'markdown',
        'py': 'python', 'java': 'java', 'cpp': 'cpp', 'c': 'c',
        'php': 'php', 'rb': 'ruby', 'go': 'go', 'rs': 'rust',
        'swift': 'swift', 'kt': 'kotlin', 'sql': 'sql',
        'xml': 'xml', 'yaml': 'yaml', 'yml': 'yaml'
      };
      
      if (languageMap[extension]) {
        setLanguage(languageMap[extension]);
      }
      
    } catch (error) {
      console.error('Error saving file as:', error);
      setSaveStatus(`❌ Save failed: ${error.message}`);
      setTimeout(() => setSaveStatus(''), 5000);
      setIsSaving(false);
    }
  }, [isMounted, content, currentFilePath, authContext]);

  const handleOpen = useCallback(async () => {
    if (!isMounted) return;
    
    if (isModified) {
      const save = window.confirm('Do you want to save the current file before opening another?');
      if (save) {
        await handleSave();
      }
    }
    
    const filePath = prompt('Enter file path to open (e.g., /Documents/myfile.txt):');
    if (!filePath || !filePath.trim()) return;
    
    try {
      setSaveStatus('📂 Loading file...');
      const fileData = await fileService.loadFile(filePath.trim());
      
      if (fileData) {
        openFileInEditor(filePath.trim(), fileData.content, fileData.mimeType);
      }
    } catch (error) {
      console.error('Error opening file:', error);
      setSaveStatus(`❌ Failed to open: ${error.message}`);
      setTimeout(() => setSaveStatus(''), 5000);
    }
  }, [isMounted, isModified, openFileInEditor, handleSave]);

  // Get current position safely
  const getCurrentPosition = useCallback(() => {
    try {
      return editorRef.current?.getPosition() || { lineNumber: 1, column: 1 };
    } catch (error) {
      return { lineNumber: 1, column: 1 };
    }
  }, []);

  const currentPosition = getCurrentPosition();

  // Format last save time
  const formatSaveTime = (time) => {
    if (!time) return '';
    return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="notepad-app">
      <div className="notepad-toolbar">
        <div className="toolbar-section">
          <button className="toolbar-button" onClick={handleNewFile} title="New File (Ctrl+N)">
            📄 New
          </button>
          <button className="toolbar-button" onClick={handleOpen} title="Open File (Ctrl+O)">
            📂 Open
          </button>
          <button 
            className="toolbar-button" 
            onClick={() => handleSave()} 
            disabled={isSaving || !authContext.isAuthenticated()}
            title={authContext.isAuthenticated() ? "Save File (Ctrl+S)" : "Login required to save"}
          >
            {isSaving ? '⏳' : '💾'} Save
          </button>
          <button 
            className="toolbar-button" 
            onClick={handleSaveAs} 
            disabled={!authContext.isAuthenticated()}
            title={authContext.isAuthenticated() ? "Save As (Ctrl+Shift+S)" : "Login required to save"}
          >
            💾 Save As
          </button>
        </div>

        <div className="toolbar-section">
          <label className="toolbar-checkbox">
            <input
              type="checkbox"
              checked={autoSaveEnabled && authContext.isAuthenticated()}
              onChange={(e) => setAutoSaveEnabled(e.target.checked)}
              disabled={!authContext.isAuthenticated()}
            />
            Auto-save {!authContext.isAuthenticated() && '(Login required)'}
          </label>
        </div>
        
        <div className="toolbar-section">
          <select 
            className="toolbar-select" 
            value={language} 
            onChange={handleLanguageChange}
            title="Language Mode"
          >
            <option value="plaintext">Plain Text</option>
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
            <option value="json">JSON</option>
            <option value="markdown">Markdown</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
            <option value="c">C</option>
            <option value="php">PHP</option>
            <option value="ruby">Ruby</option>
            <option value="go">Go</option>
            <option value="rust">Rust</option>
            <option value="swift">Swift</option>
            <option value="kotlin">Kotlin</option>
            <option value="sql">SQL</option>
            <option value="xml">XML</option>
            <option value="yaml">YAML</option>
          </select>
          
          <select 
            className="toolbar-select" 
            value={theme} 
            onChange={handleThemeChange}
            title="Theme"
          >
            <option value="vs-dark">Dark Theme</option>
            <option value="vs-light">Light Theme</option>
            <option value="hc-black">High Contrast</option>
          </select>
          
          <select 
            className="toolbar-select" 
            value={fontSize} 
            onChange={handleFontSizeChange}
            title="Font Size"
          >
            <option value={10}>10px</option>
            <option value={12}>12px</option>
            <option value={14}>14px</option>
            <option value={16}>16px</option>
            <option value={18}>18px</option>
            <option value={20}>20px</option>
            <option value={24}>24px</option>
          </select>
        </div>

        {/* **NEW: Authentication status indicator** */}
        <div className="toolbar-section">
          <span className={`auth-status ${authContext.isAuthenticated() ? 'authenticated' : 'not-authenticated'}`}>
            {authContext.isAuthenticated() ? (
              <>🔐 {authContext.user?.username || 'Logged in'}</>
            ) : (
              <>🔓 Not logged in</>
            )}
          </span>
        </div>

        {saveStatus && (
          <div className="toolbar-section">
            <span className="save-status">{saveStatus}</span>
          </div>
        )}
      </div>
      
      <div className="notepad-editor-container">
        <Editor
          height="100%"
          defaultLanguage="plaintext"
          language={language}
          theme={theme}
          value={content}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          options={{
            fontSize: fontSize,
            minimap: { enabled: true },
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            readOnly: false,
            automaticLayout: true,
            wordWrap: 'on',
            folding: true,
            foldingStrategy: 'indentation',
            showFoldingControls: 'always',
            suggestOnTriggerCharacters: true,
            quickSuggestions: true,
            parameterHints: { enabled: true },
            autoIndent: 'full',
            formatOnPaste: true,
            formatOnType: true,
            tabSize: 2,
            insertSpaces: true,
            detectIndentation: true,
            trimAutoWhitespace: true,
            largeFileOptimizations: true,
            suggest: {
              insertMode: 'replace',
              showKeywords: true,
              showSnippets: true,
              showClasses: true,
              showFunctions: true,
              showVariables: true,
              showModules: true,
              showProperties: true,
              showEvents: true,
              showOperators: true,
              showUnits: true,
              showValues: true,
              showConstants: true,
              showEnums: true,
              showEnumMembers: true,
              showColors: true,
              showFiles: true,
              showReferences: true,
              showFolders: true,
              showTypeParameters: true,
              showWords: true,
              snippetsPreventQuickSuggestions: false,
              localityBonus: true,
              shareSuggestSelections: true,
              showIcons: true,
              maxVisibleSuggestions: 12
            }
          }}
        />
      </div>
      
      <div className="notepad-statusbar">
        <span className="status-item">
          Ln {currentPosition.lineNumber}, Col {currentPosition.column}
        </span>
        <span className="status-item">{language.toUpperCase()}</span>
        <span className="status-item">{content.length} characters</span>
        <span className="status-item">{content.split('\n').length} lines</span>
        {currentFilePath && (
          <span className="status-item">📁 {currentFilePath}</span>
        )}
        {lastSaveTime && (
          <span className="status-item">💾 Last saved: {formatSaveTime(lastSaveTime)}</span>
        )}
        {isModified && (
          <span className="status-item modified">● Modified</span>
        )}
        {isSaving && (
          <span className="status-item saving">⏳ Saving...</span>
        )}
        {autoSaveEnabled && currentFilePath && authContext.isAuthenticated() && (
          <span className="status-item auto-save">🔄 Auto-save ON</span>
        )}
        {!authContext.isAuthenticated() && (
          <span className="status-item auth-warning">⚠️ Login required for saving</span>
        )}
      </div>
    </div>
  );
};

export default Notepad;