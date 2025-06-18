import React from 'react';

const Browser = () => {
  return (
    <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--window-bg, #222831)', color: '#fff', fontSize: 24, fontWeight: 500 }}>
      <span role="img" aria-label="browser" style={{ fontSize: 48, marginBottom: 16 }}>🌐</span>
      Web Browser - Coming Soon
    </div>
  );
};

export default Browser; 