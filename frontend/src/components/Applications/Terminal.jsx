import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useFileSystem } from '../../contexts/FileSystemContext';
import './Terminal.css';

const Terminal = () => {
  const {
    fileSystem,
    currentPath,
    setCurrentPath,
    getCurrentDirectoryContents,
    createFolder,
    createFile,
    deleteItems,
    pathExists,
    getItemInfo
  } = useFileSystem();

  const [history, setHistory] = useState([]);
  const [input, setInput] = useState('');
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [cwd, setCwd] = useState(currentPath);
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef(null);
  const outputRef = useRef(null);

  // Welcome message
  useEffect(() => {
    setHistory([{
      input: '',
      output: `Welcome to WebOS Terminal v1.0
Type 'help' for available commands.
Current directory: ${currentPath}`,
      isSystem: true
    }]);
  }, []);

  // Sync cwd with context
  useEffect(() => {
    setCwd(currentPath);
  }, [currentPath]);

  // Focus input on mount and after each command
  useEffect(() => {
    inputRef.current?.focus();
  }, [history]);

  // Auto-scroll to bottom when new output is added
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [history]);

  // Enhanced command parser with better error handling
  const executeCommand = useCallback((rawInput) => {
    const trimmed = rawInput.trim();
    if (!trimmed) return '';

    const [cmd, ...args] = trimmed.split(/\s+/);
    
    try {
      switch (cmd.toLowerCase()) {
        case 'help': {
          return `Available commands:
  ls [path]     - List directory contents
  cd [path]     - Change directory (.. for parent, ~ for root)
  pwd           - Print working directory
  mkdir <name>  - Create new folder
  touch <name>  - Create new file
  rm <name>     - Remove file or folder
  clear         - Clear terminal screen
  history       - Show command history
  whoami        - Show current user
  echo <text>   - Display text
  help          - Show this help message

Navigation:
  Use ↑/↓ arrow keys to navigate command history
  Tab for auto-completion (coming soon)`;
        }

        case 'ls': {
          const targetPath = args[0] || cwd;
          const absolutePath = targetPath.startsWith('/') ? targetPath : 
            (cwd === '/' ? `/${targetPath}` : `${cwd}/${targetPath}`);
          
          try {
            const contents = getCurrentDirectoryContents(absolutePath);
            if (contents.length === 0) {
              return 'Directory is empty';
            }
            
            // Format output with colors and icons
            return contents.map(item => {
              const icon = item.type === 'folder' ? '📁' : '📄';
              const name = item.name + (item.type === 'folder' ? '/' : '');
              const size = item.type === 'file' ? ` (${item.size} bytes)` : '';
              return `${icon} ${name}${size}`;
            }).join('\n');
          } catch {
            return `ls: cannot access '${targetPath}': No such file or directory`;
          }
        }

        case 'cd': {
          let target = args[0];
          if (!target || target === '~') {
            setCurrentPath('/');
            setCwd('/');
            return 'Changed to root directory';
          }
          
          if (target === '..') {
            if (cwd !== '/') {
              const parentPath = cwd.split('/').slice(0, -1).join('/') || '/';
              setCurrentPath(parentPath);
              setCwd(parentPath);
              return `Changed to ${parentPath}`;
            } else {
              return 'Already at root directory';
            }
          }
          
          const absolutePath = target.startsWith('/') ? target : 
            (cwd === '/' ? `/${target}` : `${cwd}/${target}`);
          
          if (pathExists(absolutePath)) {
            const itemInfo = getItemInfo(absolutePath);
            if (itemInfo && itemInfo.type === 'folder') {
              setCurrentPath(absolutePath);
              setCwd(absolutePath);
              return `Changed to ${absolutePath}`;
            } else {
              return `cd: not a directory: ${target}`;
            }
          } else {
            return `cd: no such directory: ${target}`;
          }
        }
        

        case 'pwd': {
          return cwd;
        }

        case 'mkdir': {
          if (!args[0]) {
            return 'mkdir: missing operand\nUsage: mkdir <folder_name>';
          }
          
          try {
            const newPath = createFolder(args[0], cwd);
            return `Created folder: ${args[0]} at ${newPath}`;
          } catch (error) {
            return `mkdir: cannot create directory '${args[0]}': ${error.message}`;
          }
        }

        case 'touch': {
          if (!args[0]) {
            return 'touch: missing operand\nUsage: touch <file_name>';
          }
          
          try {
            const newPath = createFile(args[0], '', cwd);
            return `Created file: ${args[0]} at ${newPath}`;
          } catch (error) {
            return `touch: cannot create file '${args[0]}': ${error.message}`;
          }
        }

        case 'rm': {
          if (!args[0]) {
            return 'rm: missing operand\nUsage: rm <file_or_folder_name>';
          }
          
          const target = args[0];
          const absolutePath = target.startsWith('/') ? target : 
            (cwd === '/' ? `/${target}` : `${cwd}/${target}`);
          
          if (!pathExists(absolutePath)) {
            return `rm: cannot remove '${target}': No such file or directory`;
          }
          
          try {
            deleteItems([absolutePath]);
            return `Removed: ${target}`;
          } catch (error) {
            return `rm: cannot remove '${target}': ${error.message}`;
          }
        }

        case 'clear': {
          setHistory([]);
          return null; // Special case - don't add to history
        }

        case 'history': {
          if (commandHistory.length === 0) {
            return 'No command history available';
          }
          return commandHistory.map((cmd, index) => 
            `${index + 1}. ${cmd}`
          ).join('\n');
        }

        case 'whoami': {
          return 'webos-user';
        }

        case 'echo': {
          return args.join(' ') || '';
        }

        case 'date': {
          return new Date().toString();
        }

        case 'cat': {
          if (!args[0]) {
            return 'cat: missing operand\nUsage: cat <file_name>';
          }
          
          const target = args[0];
          const absolutePath = target.startsWith('/') ? target : 
            (cwd === '/' ? `/${target}` : `${cwd}/${target}`);
          
          if (!pathExists(absolutePath)) {
            return `cat: ${target}: No such file or directory`;
          }
          
          const itemInfo = getItemInfo(absolutePath);
          if (itemInfo.type === 'folder') {
            return `cat: ${target}: Is a directory`;
          }
          
          return itemInfo.content || '[Empty file]';
        }

        case 'find': {
          if (!args[0]) {
            return 'find: missing operand\nUsage: find <name_pattern>';
          }
          
          const pattern = args[0].toLowerCase();
          const results = [];
          
          const searchRecursively = (path) => {
            const contents = getCurrentDirectoryContents(path);
            contents.forEach(item => {
              if (item.name.toLowerCase().includes(pattern)) {
                results.push(item.path);
              }
              if (item.type === 'folder') {
                searchRecursively(item.path);
              }
            });
          };
          
          searchRecursively('/');
          
          if (results.length === 0) {
            return `find: no files or directories matching '${pattern}' found`;
          }
          
          return results.join('\n');
        }

        case 'tree': {
          const targetPath = args[0] || cwd;
          if (!pathExists(targetPath)) {
            return `tree: ${targetPath}: No such directory`;
          }
          const buildTree = (path, prefix = '', isLast = true) => {
            const itemInfo = getItemInfo(path);
            if (!itemInfo) return '';
            let result = prefix + (isLast ? '└── ' : '├── ') + itemInfo.name + '\n';
            if (itemInfo.type === 'folder') {
              const contents = getCurrentDirectoryContents(path);
              contents.forEach((child, index) => {
                const isLastChild = index === contents.length - 1;
                const newPrefix = prefix + (isLast ? '    ' : '│   ');
                result += buildTree(child.path, newPrefix, isLastChild);
              });
            }
            return result;
          };
          const itemInfo = getItemInfo(targetPath);
          return itemInfo.name + '\n' + buildTree(targetPath).slice(0, -1);
        }

        default: {
          const suggestions = ['help', 'ls', 'cd', 'pwd', 'mkdir', 'touch', 'rm', 'clear'];
          const closest = suggestions.find(s => s.includes(cmd.toLowerCase()));
          const suggestion = closest ? `\nDid you mean: ${closest}?` : '';
          return `Command not found: ${cmd}${suggestion}\nType 'help' for available commands.`;
        }
      }
    } catch (error) {
      return `Error: ${error.message}`;
    }
  }, [cwd, fileSystem, getCurrentDirectoryContents, createFolder, createFile, deleteItems, setCurrentPath, commandHistory]);

  const handleCommand = useCallback((rawInput) => {
    const trimmed = rawInput.trim();
    if (!trimmed) return;

    // Add to command history
    setCommandHistory(prev => {
      const newHistory = [...prev.filter(cmd => cmd !== trimmed), trimmed];
      return newHistory.slice(-50); // Keep last 50 commands
    });
    setHistoryIndex(-1);

    const output = executeCommand(trimmed);
    
    if (output !== null) { // null means don't add to history (like clear command)
      setHistory(prev => [...prev, { 
        input: trimmed, 
        output,
        timestamp: new Date().toLocaleTimeString()
      }]);
    }
  }, [executeCommand]);

  const handleKeyDown = useCallback((e) => {
    switch (e.key) {
      case 'Enter': {
        e.preventDefault();
        handleCommand(input);
        setInput('');
        setIsTyping(false);
        break;
      }
      
      case 'ArrowUp': {
        e.preventDefault();
        if (commandHistory.length > 0) {
          const newIndex = historyIndex === -1 ? 
            commandHistory.length - 1 : 
            Math.max(0, historyIndex - 1);
          setHistoryIndex(newIndex);
          setInput(commandHistory[newIndex]);
        }
        break;
      }
      
      case 'ArrowDown': {
        e.preventDefault();
        if (historyIndex >= 0) {
          const newIndex = historyIndex + 1;
          if (newIndex >= commandHistory.length) {
            setHistoryIndex(-1);
            setInput('');
          } else {
            setHistoryIndex(newIndex);
            setInput(commandHistory[newIndex]);
          }
        }
        break;
      }
      
      case 'Tab': {
        e.preventDefault();
        // TODO: Implement auto-completion
        break;
      }
      
      case 'Escape': {
        e.preventDefault();
        setInput('');
        setHistoryIndex(-1);
        setIsTyping(false);
        break;
      }
    }
  }, [input, commandHistory, historyIndex, handleCommand]);

  const [cursorPosition, setCursorPosition] = useState(0);
  const measureRef = useRef(null);

  // Calculate cursor position based on input text
  useEffect(() => {
    if (measureRef.current) {
      const textWidth = measureRef.current.offsetWidth;
      setCursorPosition(textWidth);
    }
  }, [input]);

  const handleInputChange = useCallback((e) => {
    setInput(e.target.value);
    setIsTyping(e.target.value.length > 0);
    setHistoryIndex(-1); // Reset history navigation when typing
  }, []);

  const getPrompt = () => {
    const user = 'webos-user';
    const host = 'webos';
    const path = cwd === '/' ? '/' : cwd.split('/').pop();
    return `${user}@${host}:${path}$`;
  };

  return (
    <div className="terminal-container">

      <div 
        ref={outputRef}
        className="terminal-output"
      >
        {history.map((entry, idx) => (
          <div key={idx} className="terminal-entry">
            {!entry.isSystem && (
              <div className="terminal-input-line">
                <span className="terminal-prompt">{getPrompt()}</span>
                <span className="terminal-command">{entry.input}</span>
                {entry.timestamp && (
                  <span className="terminal-timestamp">[{entry.timestamp}]</span>
                )}
              </div>
            )}
            {entry.output && (
              <div className={`terminal-output-text ${entry.isSystem ? 'system' : ''}`}>
                {entry.output}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="terminal-input-container">
        <span className="terminal-prompt current">{getPrompt()}</span>
        <div className="terminal-input-wrapper">
          {/* Hidden element to measure text width */}
          <span 
            ref={measureRef}
            className="terminal-input-measure"
          >
            {input}
          </span>
          
          <input
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className={`terminal-input ${isTyping ? 'typing' : ''}`}
            autoFocus
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
          />
          
          <div 
            className="terminal-cursor" 
            style={{ left: `${cursorPosition}px` }}
          />
        </div>
      </div>

      <div className="terminal-status">
        <span className="status-info">
          Ready | Commands: {commandHistory.length} | Path: {cwd}
        </span>
        <span className="status-help">
          Press ↑/↓ for history, ESC to clear, Tab for completion
        </span>
      </div>
    </div>
  );
};

export default Terminal;