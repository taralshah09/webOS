// WallpaperModal.jsx - New component for wallpaper selection
import React, { useState } from 'react';
import './WallpaperModal.css';

const WallpaperModal = ({ currentWallpaper, onWallpaperChange, onClose }) => {
  const [wallpaperUrl, setWallpaperUrl] = useState(currentWallpaper || '');
  const [previewUrl, setPreviewUrl] = useState(currentWallpaper || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Predefined wallpaper options
  const predefinedWallpapers = [
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop',
    'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1920&h=1080&fit=crop',
    'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=1920&h=1080&fit=crop',
    'https://images.unsplash.com/photo-1464822759844-d150baec5d5b?w=1920&h=1080&fit=crop',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&h=1080&fit=crop'
  ];

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setWallpaperUrl(url);
    setError('');
    
    // Update preview if URL looks valid
    if (url && (url.startsWith('http') || url.startsWith('data:'))) {
      setPreviewUrl(url);
    }
  };

  const handlePredefinedSelect = (url) => {
    setWallpaperUrl(url);
    setPreviewUrl(url);
    setError('');
  };

  const handleApply = async () => {
    if (!wallpaperUrl.trim()) {
      setError('Please enter a wallpaper URL');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      
      // Test if image loads
      const img = new Image();
      img.onload = () => {
        onWallpaperChange(wallpaperUrl);
        setIsLoading(false);
      };
      img.onerror = () => {
        setError('Failed to load image. Please check the URL.');
        setIsLoading(false);
      };
      img.src = wallpaperUrl;
      
    } catch (err) {
      setError('Error applying wallpaper');
      setIsLoading(false);
    }
  };

  const handleRemove = () => {
    onWallpaperChange('');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target.result;
          setWallpaperUrl(dataUrl);
          setPreviewUrl(dataUrl);
          setError('');
        };
        reader.readAsDataURL(file);
      } else {
        setError('Please select a valid image file');
      }
    }
  };

  return (
    <div className="wallpaper-modal-overlay" onClick={onClose}>
      <div className="wallpaper-modal" onClick={(e) => e.stopPropagation()}>
        <div className="wallpaper-modal-header">
          <h2>🖼️ Personalize Desktop</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>
        
        <div className="wallpaper-modal-content">
          {/* Current preview */}
          <div className="wallpaper-preview">
            <h3>Preview</h3>
            <div 
              className="preview-area"
              style={{
                backgroundImage: previewUrl ? `url(${previewUrl})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              {!previewUrl && <span>No wallpaper selected</span>}
            </div>
          </div>

          {/* URL input */}
          <div className="wallpaper-input-section">
            <h3>Enter Image URL</h3>
            <input
              type="text"
              placeholder="https://example.com/wallpaper.jpg"
              value={wallpaperUrl}
              onChange={handleUrlChange}
              className="wallpaper-url-input"
            />
          </div>

          {/* File upload */}
          <div className="wallpaper-upload-section">
            <h3>Or Upload Image</h3>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="wallpaper-file-input"
            />
          </div>

          {/* Predefined options */}
          <div className="wallpaper-presets">
            <h3>Quick Select</h3>
            <div className="preset-grid">
              {predefinedWallpapers.map((url, index) => (
                <div
                  key={index}
                  className="preset-option"
                  style={{
                    backgroundImage: `url(${url})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                  onClick={() => handlePredefinedSelect(url)}
                />
              ))}
            </div>
          </div>

          {error && <div className="wallpaper-error">{error}</div>}
        </div>

        <div className="wallpaper-modal-footer">
          <button onClick={handleRemove} className="wallpaper-button secondary">
            Remove Wallpaper
          </button>
          <button onClick={onClose} className="wallpaper-button secondary">
            Cancel
          </button>
          <button 
            onClick={handleApply} 
            className="wallpaper-button primary"
            disabled={isLoading}
          >
            {isLoading ? 'Applying...' : 'Apply'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WallpaperModal;