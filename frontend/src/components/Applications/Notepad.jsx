import React, { useState, useRef, useEffect, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import fileService from '../../services/fileService';
import './Notepad.css';

const Notepad = ({ initialContent, initialFilePath, initialLanguage }) => {
  const [content, setContent] = useState(initialContent || `Welcome to Web OS Notepad!

This is a professional text editor powered by Monaco Editor - the same editor used in Visual Studio Code.

Features:
• Syntax highlighting for multiple languages
• Line numbers and minimap
• Auto-completion and IntelliSense
• Multiple themes and customization options
• Professional editing experience

You can:  
- Type and edit text with advanced features
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
  const [isMounted, setIsMounted] = useState(true);
  const editorRef = useRef(null);
  const unregistersRef = useRef([]);

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

  // Stable callback for opening files
  const openFileInEditor = useCallback((filePath, fileContent, fileType) => {
    // Check if component is still mounted
    if (!isMounted) return;
    
    setContent(fileContent || '');
    setCurrentFilePath(filePath);
    setIsModified(false);
    
    // Set language based on file type
    const languageMap = {
      'javascript': 'javascript',
      'typescript': 'typescript',
      'html': 'html',
      'css': 'css',
      'json': 'json',
      'markdown': 'markdown',
      'python': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'php': 'php',
      'ruby': 'ruby',
      'go': 'go',
      'rust': 'rust',
      'swift': 'swift',
      'kotlin': 'kotlin',
      'sql': 'sql',
      'xml': 'xml',
      'yaml': 'yaml',
      'text': 'plaintext'
    };
    
    setLanguage(languageMap[fileType] || 'plaintext');
  }, [isMounted]);

  // Register with file service
  useEffect(() => {
    const unregisters = [];
    
    try {
      // Register for text files
      unregisters.push(fileService.registerFileOpener('text', openFileInEditor));

      // Register for all supported file types
      const supportedTypes = [
        'javascript', 'typescript', 'html', 'css', 'json', 'markdown',
        'python', 'java', 'cpp', 'c', 'php', 'ruby', 'go', 'rust',
        'swift', 'kotlin', 'sql', 'xml', 'yaml'
      ];

      supportedTypes.forEach(type => {
        unregisters.push(fileService.registerFileOpener(type, openFileInEditor));
      });

      // Store unregisters in ref for cleanup
      unregistersRef.current = unregisters;
    } catch (error) {
      console.warn('Error registering file openers:', error);
    }

    return () => {
      // Cleanup all file service registrations
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setIsMounted(false);
      
      // Dispose Monaco editor
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
    
    // Add error handling for editor events
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
    if (currentFilePath) {
      setIsModified(true);
    }
  }, [isMounted, currentFilePath]);

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
    
    setContent('');
    setCurrentFilePath(null);
    setIsModified(false);
    setLanguage('plaintext');
  }, [isMounted]);

  const handleSave = useCallback(() => {
    if (!isMounted) return;
    
    if (currentFilePath) {
      // Save to the file system (this would need to be integrated with the file system)
      console.log('Saving to:', currentFilePath, content);
      setIsModified(false);
    } else {
      // Save as new file
      try {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'document.txt';
        a.click();
        
        // Clean up the URL after a short delay
        setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 100);
      } catch (error) {
        console.error('Error saving file:', error);
      }
    }
  }, [isMounted, currentFilePath, content]);

  const handleSaveAs = useCallback(() => {
    if (!isMounted) return;
    
    try {
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = currentFilePath ? currentFilePath.split('/').pop() : 'document.txt';
      a.click();
      
      // Clean up the URL after a short delay
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error('Error saving file as:', error);
    }
  }, [isMounted, content, currentFilePath]);

  const handleOpen = useCallback(() => {
    if (!isMounted) return;
    
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.txt,.js,.jsx,.ts,.tsx,.html,.css,.json,.md,.py,.java,.cpp,.c,.php,.rb,.go,.rs,.swift,.kt';
      
      const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && isMounted) {
          const reader = new FileReader();
          reader.onload = (e) => {
            if (!isMounted) return;
            
            const extension = file.name.split('.').pop().toLowerCase();
            const languageMap = {
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
              'kt': 'kotlin'
            };
            
            openFileInEditor(file.name, e.target.result, languageMap[extension] || 'text');
          };
          
          reader.onerror = () => {
            console.error('Error reading file');
          };
          
          reader.readAsText(file);
        }
        
        // Clean up the input element
        if (input.parentNode) {
          input.parentNode.removeChild(input);
        }
      };
      
      input.onchange = handleFileChange;
      
      // Add to DOM temporarily to trigger click
      input.style.display = 'none';
      document.body.appendChild(input);
      input.click();
      
    } catch (error) {
      console.error('Error opening file:', error);
    }
  }, [isMounted, openFileInEditor]);

  // Get current position safely
  const getCurrentPosition = useCallback(() => {
    try {
      return editorRef.current?.getPosition() || { lineNumber: 1, column: 1 };
    } catch (error) {
      return { lineNumber: 1, column: 1 };
    }
  }, []);

  const currentPosition = getCurrentPosition();

  return (
    <div className="notepad-app">
      <div className="notepad-toolbar">
        <div className="toolbar-section">
          <button className="toolbar-button" onClick={handleNewFile}>
            📄 New
          </button>
          <button className="toolbar-button" onClick={handleOpen}>
            📂 Open
          </button>
          <button className="toolbar-button" onClick={handleSave}>
            💾 Save
          </button>
          <button className="toolbar-button" onClick={handleSaveAs}>
            💾 Save As
          </button>
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
        {isModified && (
          <span className="status-item">● Modified</span>
        )}
      </div>
    </div>
  );
};

export default Notepad;