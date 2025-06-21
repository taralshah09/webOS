import React, { useState } from 'react';
import './WallpaperModal.css';

const WallpaperModal = ({ currentWallpaper, onWallpaperChange, onClose }) => {
  const [wallpaperUrl, setWallpaperUrl] = useState(currentWallpaper || '');
  const [previewUrl, setPreviewUrl] = useState(currentWallpaper || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('presets');

  // Predefined wallpaper options
  const predefinedWallpapers = [
    {
      url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop',
      name: 'Mountain Lake'
    },
    {
      url: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1920&h=1080&fit=crop',
      name: 'Space Nebula'
    },
    {
      url: 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=1920&h=1080&fit=crop',
      name: 'Ocean Waves'
    },
    {
      url: 'https://images.unsplash.com/photo-1464822759844-d150baec5d5b?w=1920&h=1080&fit=crop',
      name: 'Forest Path'
    },
    {
      url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&h=1080&fit=crop',
      name: 'Desert Dunes'
    },
    {
      url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1920&h=1080&fit=crop',
      name: 'City Lights'
    }
  ];

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setWallpaperUrl(url);
    setError('');

    if (url && (url.startsWith('http') || url.startsWith('data:'))) {
      setPreviewUrl(url);
    }
  };

  const handlePredefinedSelect = (wallpaper) => {
    setWallpaperUrl(wallpaper.url);
    setPreviewUrl(wallpaper.url);
    setError('');
  };

  const handleApply = async () => {
    if (!wallpaperUrl.trim()) {
      setError('Please select a wallpaper or enter a URL');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      const img = new Image();
      img.onload = () => {
        onWallpaperChange(wallpaperUrl);
        setIsLoading(false);
        onClose();
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
    onClose();
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


        <div className="wallpaper-modal-body">
          {/* Left Panel - Preview */}
          <div className="preview-panel">
            <h3>Preview</h3>
            <div className="preview-container">
              <div
                className={`preview-area ${previewUrl ? 'has-image' : ''}`}
                style={{
                  backgroundImage: previewUrl ? `url(${previewUrl})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                {!previewUrl && (
                  <div className="preview-empty">
                    <div className="preview-empty-icon">🖼️</div>
                    <p>No wallpaper selected</p>
                  </div>
                )}
                {previewUrl && (
                  <div className="preview-overlay">
                    <div className="preview-label">Current Selection</div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="preview-actions">
              <button
                onClick={handleApply}
                className={`apply-button ${isLoading || !wallpaperUrl.trim() ? 'disabled' : ''}`}
                disabled={isLoading || !wallpaperUrl.trim()}
              >
                {isLoading ? (
                  <>
                    <div className="loading-spinner"></div>
                    Applying...
                  </>
                ) : (
                  'Apply Wallpaper'
                )}
              </button>

              <div className="action-buttons">
                <button onClick={handleRemove} className="remove-button">
                  Remove
                </button>
                <button onClick={onClose} className="cancel-button">
                  Cancel
                </button>
              </div>
            </div>

            {error && (
              <div className="error-message">{error}</div>
            )}
          </div>

          {/* Right Panel - Options */}
          <div className="options-panel">
            {/* Tab Navigation */}
            <div className="tab-navigation">
              <button
                className={`tab-button ${activeTab === 'presets' ? 'active' : ''}`}
                onClick={() => setActiveTab('presets')}
              >
                Gallery
              </button>
              <button
                className={`tab-button ${activeTab === 'url' ? 'active' : ''}`}
                onClick={() => setActiveTab('url')}
              >
                Custom URL
              </button>
              <button
                className={`tab-button ${activeTab === 'upload' ? 'active' : ''}`}
                onClick={() => setActiveTab('upload')}
              >
                Upload
              </button>
            </div>

            {/* Tab Content */}
            <div className="tab-content">
              {activeTab === 'presets' && (
                <div className="presets-tab">
                  <h3>Choose from Gallery</h3>
                  <div className="presets-grid">
                    {predefinedWallpapers.map((wallpaper, index) => (
                      <div
                        key={index}
                        className={`preset-item ${previewUrl === wallpaper.url ? 'selected' : ''}`}
                        style={{
                          backgroundImage: `url(${wallpaper.url})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center'
                        }}
                        onClick={() => handlePredefinedSelect(wallpaper)}
                      >
                        <div className="preset-overlay">
                          <div className="preset-name">{wallpaper.name}</div>
                        </div>
                        {previewUrl === wallpaper.url && (
                          <div className="preset-selected">✓</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'url' && (
                <div className="url-tab">
                  <h3>Enter Image URL</h3>
                  <div className="url-input-section">
                    <label className="input-label">Image URL</label>
                    <input
                      type="text"
                      placeholder="https://example.com/wallpaper.jpg"
                      value={wallpaperUrl}
                      onChange={handleUrlChange}
                      className="url-input"
                    />
                  </div>

                  <div className="tip-box">
                    <h4>💡 Tip</h4>
                    <p>
                      For best results, use high-resolution images (1920x1080 or higher) in JPEG or PNG format.
                      Make sure the URL is publicly accessible.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'upload' && (
                <div className="upload-tab">
                  <h3>Upload Image</h3>
                  <div className="upload-area">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="file-input"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="upload-label">
                      <div className="upload-icon">📁</div>
                      <p className="upload-title">Click to upload an image</p>
                      <p className="upload-subtitle">
                        Supports JPEG, PNG, GIF up to 10MB
                      </p>
                    </label>
                  </div>

                  <div className="formats-box">
                    <h4>📋 Supported formats</h4>
                    <ul>
                      <li>• JPEG (.jpg, .jpeg)</li>
                      <li>• PNG (.png)</li>
                      <li>• GIF (.gif)</li>
                      <li>• WebP (.webp)</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WallpaperModal;