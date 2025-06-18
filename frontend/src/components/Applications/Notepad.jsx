import React, { useState } from 'react';
import './Notepad.css';

const Notepad = () => {
  const [text, setText] = useState('Welcome to Web OS Notepad!\n\nThis is a sample application to demonstrate the window management system.\n\nYou can:\n- Type and edit text\n- Resize this window\n- Move it around\n- Minimize, maximize, and close it\n\nEnjoy your web-based operating system!');

  return (
    <div className="notepad-app">
      <div className="notepad-toolbar">
        <button className="toolbar-button">File</button>
        <button className="toolbar-button">Edit</button>
        <button className="toolbar-button">Format</button>
        <button className="toolbar-button">View</button>
        <button className="toolbar-button">Help</button>
      </div>
      <textarea
        className="notepad-textarea"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Start typing here..."
      />
    </div>
  );
};

export default Notepad; 