import React, { useState, useRef, useEffect } from 'react';
import './Browser.css';

const Browser = () => {
  const [url, setUrl] = useState('https://www.example.com');
  const [inputValue, setInputValue] = useState(url);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState(['https://www.example.com']);
  const [historyIndex, setHistoryIndex] = useState(0);
  const iframeRef = useRef(null);

  // List of iframe-friendly websites (tested and working)
  const iframeFriendlyUrls = [
    'https://www.example.com',
    'https://httpbin.org',
    'https://jsonplaceholder.typicode.com',
    'https://www.w3schools.com',
    'https://codepen.io',
    'https://jsfiddle.net',
    'https://replit.com',
    'https://glitch.com',
    'https://embed.plnkr.co',
    'https://stackblitz.com'
  ];

  // Preset bookmarks for easy access (guaranteed to work)
  const bookmarks = [
    { name: 'Example.com', url: 'https://www.example.com', icon: '🌐' },
    { name: 'HTTPBin API', url: 'https://httpbin.org', icon: '🔧' },
    { name: 'W3Schools', url: 'https://www.w3schools.com', icon: '📚' },
    { name: 'CodePen', url: 'https://codepen.io', icon: '✏️' },
    { name: 'JSFiddle', url: 'https://jsfiddle.net', icon: '🎯' },
    { name: 'Replit', url: 'https://replit.com', icon: '💻' }
  ];

  // Sites that commonly block iframe embedding
  const blockedSites = [
    'youtube.com', 'google.com', 'facebook.com', 'twitter.com', 'instagram.com',
    'linkedin.com', 'github.com', 'amazon.com', 'netflix.com', 'spotify.com',
    'reddit.com', 'pinterest.com', 'tiktok.com', 'whatsapp.com', 'zoom.us'
  ];

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoad = () => {
      setIsLoading(false);
      setError(null);
    };

    const handleError = () => {
      setIsLoading(false);
      setError('Failed to load webpage. This site may not allow embedding.');
    };

    iframe.addEventListener('load', handleLoad);
    iframe.addEventListener('error', handleError);

    return () => {
      iframe.removeEventListener('load', handleLoad);
      iframe.removeEventListener('error', handleError);
    };
  }, []);

  const handleInputChange = (e) => setInputValue(e.target.value);

  const navigateToUrl = (newUrl) => {
    if (!newUrl.trim()) return;

    // Add protocol if missing
    if (!/^https?:\/\//i.test(newUrl)) {
      newUrl = 'https://' + newUrl;
    }

    // Check if the site is known to block iframes
    const domain = new URL(newUrl).hostname.replace('www.', '');
    const isBlocked = blockedSites.some(blockedSite => domain.includes(blockedSite));
    
    if (isBlocked) {
      setError(`⚠️ ${domain} blocks iframe embedding. Try one of our suggested sites below.`);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setUrl(newUrl);
    setInputValue(newUrl);

    // Add to history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newUrl);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleGo = (e) => {
    e.preventDefault();
    navigateToUrl(inputValue);
  };

  const handleBookmarkClick = (bookmarkUrl) => {
    navigateToUrl(bookmarkUrl);
  };

  const handleBack = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const previousUrl = history[newIndex];
      setHistoryIndex(newIndex);
      setUrl(previousUrl);
      setInputValue(previousUrl);
      setIsLoading(true);
      setError(null);
    }
  };

  const handleForward = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const nextUrl = history[newIndex];
      setHistoryIndex(newIndex);
      setUrl(nextUrl);
      setInputValue(nextUrl);
      setIsLoading(true);
      setError(null);
    }
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setError(null);
    
    // Force iframe reload by temporarily clearing src then setting it back
    const iframe = iframeRef.current;
    if (iframe) {
      const currentUrl = iframe.src;
      iframe.src = 'about:blank'; // Clear first
      setTimeout(() => {
        iframe.src = currentUrl; // Then reload
      }, 10);
    }
  };

  const handleHome = () => {
    navigateToUrl('https://www.example.com');
  };

  const canGoBack = historyIndex > 0;
  const canGoForward = historyIndex < history.length - 1;

  return (
    <div className="browser-container">
      {/* Browser Toolbar */}
      <div className="browser-toolbar">
        {/* Navigation Buttons */}
        <div className="nav-buttons">
          <button 
            onClick={handleBack} 
            disabled={!canGoBack}
            className="nav-btn"
            title="Back"
          >
            ←
          </button>
          <button 
            onClick={handleForward} 
            disabled={!canGoForward}
            className="nav-btn"
            title="Forward"
          >
            →
          </button>
          <button 
            onClick={handleRefresh}
            className="nav-btn"
            title="Refresh"
          >
            ↻
          </button>
          <button 
            onClick={handleHome}
            className="nav-btn"
            title="Home"
          >
            🏠
          </button>
        </div>

        {/* Address Bar */}
        <form onSubmit={handleGo} className="address-bar">
          <div className="url-input-container">
            <span className="security-icon">🔒</span>
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Enter URL or search..."
              className="url-input"
            />
            <button type="submit" className="go-btn">
              Go
            </button>
          </div>
        </form>

        {/* Menu Button */}
        <button className="menu-btn" title="Menu">
          ⋮
        </button>
      </div>

      {/* Bookmarks Bar */}
      <div className="bookmarks-bar">
        <span className="bookmarks-label">📌 Iframe-Safe Sites:</span>
        {bookmarks.map((bookmark, index) => (
          <button
            key={index}
            onClick={() => handleBookmarkClick(bookmark.url)}
            className="bookmark-btn"
            title={bookmark.url}
          >
            <span className="bookmark-icon">{bookmark.icon}</span>
            {bookmark.name}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="browser-content">
        {isLoading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <span>Loading...</span>
          </div>
        )}

        {error && (
          <div className="error-overlay">
            <div className="error-content">
              <h3>🚫 Website Cannot Be Displayed</h3>
              <p>{error}</p>
              
              <div className="blocked-explanation">
                <h4>💡 Why This Happens:</h4>
                <ul>
                  <li><strong>Security Policy:</strong> Sites like YouTube, Google, Facebook use X-Frame-Options</li>
                  <li><strong>Iframe Protection:</strong> Prevents embedding to avoid clickjacking attacks</li>
                  <li><strong>Browser Limitation:</strong> This is intentional and cannot be bypassed</li>
                </ul>
              </div>

              <div className="error-suggestions">
                <h4>✅ Try These Working Alternatives:</h4>
                <div className="suggested-sites">
                  {iframeFriendlyUrls.slice(0, 6).map((siteUrl, index) => (
                    <button
                      key={index}
                      onClick={() => navigateToUrl(siteUrl)}
                      className="suggested-site-btn"
                    >
                      🌐 {siteUrl.replace('https://www.', '').replace('https://', '')}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="alternative-suggestion">
                <h4>🎯 For Popular Sites:</h4>
                <p>Use the main desktop to open these sites in a new window instead of the browser iframe.</p>
              </div>
              
              <button onClick={() => navigateToUrl('https://www.example.com')} className="retry-btn">
                🏠 Go to Safe Home Page
              </button>
            </div>
          </div>
        )}

        <iframe
          ref={iframeRef}
          src={url}
          title="Web Browser"
          className="browser-iframe"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
          onLoad={() => {
            setIsLoading(false);
            setError(null);
          }}
          onError={() => {
            setIsLoading(false);
            setError('This website cannot be displayed in an iframe due to security restrictions.');
          }}
        />
      </div>

      {/* Status Bar */}
      <div className="status-bar">
        <span className="status-text">
          {isLoading ? 'Loading...' : error ? 'Error loading page' : 'Ready'}
        </span>
        <span className="zoom-control">100%</span>
      </div>
    </div>
  );
};

export default Browser;