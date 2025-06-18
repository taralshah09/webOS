import React, { useState, useRef, useEffect } from 'react';
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
  const editorRef = useRef(null);

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

  // Register with file service
  useEffect(() => {
    const unregister = fileService.registerFileOpener('text', (filePath, fileContent, fileType) => {
      openFileInEditor(filePath, fileContent, fileType);
    });

    // Register for all supported file types
    const supportedTypes = [
      'javascript', 'typescript', 'html', 'css', 'json', 'markdown',
      'python', 'java', 'cpp', 'c', 'php', 'ruby', 'go', 'rust',
      'swift', 'kotlin', 'sql', 'xml', 'yaml'
    ];

    supportedTypes.forEach(type => {
      fileService.registerFileOpener(type, (filePath, fileContent, fileType) => {
        openFileInEditor(filePath, fileContent, fileType);
      });
    });

    return () => {
      unregister();
      supportedTypes.forEach(type => {
        fileService.openFileCallbacks.delete(type);
      });
    };
  }, []);

  const openFileInEditor = (filePath, fileContent, fileType) => {
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
  };

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
  };

  const handleEditorChange = (value, event) => {
    setContent(value);
    if (currentFilePath) {
      setIsModified(true);
    }
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  const handleThemeChange = (e) => {
    setTheme(e.target.value);
  };

  const handleFontSizeChange = (e) => {
    setFontSize(parseInt(e.target.value));
  };

  const handleNewFile = () => {
    setContent('');
    setCurrentFilePath(null);
    setIsModified(false);
    setLanguage('plaintext');
  };

  const handleSave = () => {
    if (currentFilePath) {
      // Save to the file system (this would need to be integrated with the file system)
      console.log('Saving to:', currentFilePath, content);
      setIsModified(false);
    } else {
      // Save as new file
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'document.txt';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleSaveAs = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentFilePath ? currentFilePath.split('/').pop() : 'document.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleOpen = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,.js,.jsx,.ts,.tsx,.html,.css,.json,.md,.py,.java,.cpp,.c,.php,.rb,.go,.rs,.swift,.kt';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
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
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const getWindowTitle = () => {
    if (currentFilePath) {
      const fileName = currentFilePath.split('/').pop();
      return `${fileName}${isModified ? ' *' : ''} - Notepad`;
    }
    return `Untitled${isModified ? ' *' : ''} - Notepad`;
  };

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
        <span className="status-item">Ln {editorRef.current?.getPosition()?.lineNumber || 1}, Col {editorRef.current?.getPosition()?.column || 1}</span>
        <span className="status-item">{language.toUpperCase()}</span>
        <span className="status-item">{content.length} characters</span>
        <span className="status-item">{content.split('\n').length} lines</span>
        {currentFilePath && (
          <span className="status-item">📁 {currentFilePath}</span>
        )}
      </div>
    </div>
  );
};

export default Notepad; 