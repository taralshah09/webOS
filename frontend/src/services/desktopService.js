const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const getDesktop = async (token) => {
  const res = await fetch(`${API_URL}/desktop`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    }
  });
  if (!res.ok) throw new Error((await res.json()).message || 'Failed to fetch desktop');
  return res.json();
};

export const updateDesktopIcons = async (desktopIcons, token) => {
  const res = await fetch(`${API_URL}/desktop/icons`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
    body: JSON.stringify({ desktopIcons })
  });
  if (!res.ok) throw new Error((await res.json()).message || 'Failed to update desktop icons');
  return res.json();
};

export const updateIconPosition = async (iconId, position, token) => {
  const res = await fetch(`${API_URL}/desktop/icon-position`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
    body: JSON.stringify({ iconId, position })
  });
  if (!res.ok) throw new Error((await res.json()).message || 'Failed to update icon position');
  return res.json();
};

export const updateWallpaper = async (wallpaper, token) => {
  try {
    const response = await fetch(`${API_URL}/desktop/wallpaper`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        wallpaper
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update wallpaper');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating wallpaper:', error);
    throw error;
  }
};

// Validate image URL - UTILITY FUNCTION
export const validateImageUrl = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => reject(new Error('Invalid image URL'));
    img.src = url;
  });
};

// Get wallpaper presets - UTILITY FUNCTION
export const getWallpaperPresets = () => {
  return [
    {
      id: 'mountains',
      name: 'Mountain Vista',
      url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop&q=80'
    },
    {
      id: 'space',
      name: 'Space Galaxy',
      url: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1920&h=1080&fit=crop&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=300&h=200&fit=crop&q=80'
    },
    {
      id: 'ocean',
      name: 'Ocean Waves',
      url: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=1920&h=1080&fit=crop&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=300&h=200&fit=crop&q=80'
    },
    {
      id: 'forest',
      name: 'Forest Path',
      url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&h=1080&fit=crop&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=200&fit=crop&q=80'
    },
    {
      id: 'city',
      name: 'City Skyline',
      url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1920&h=1080&fit=crop&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=300&h=200&fit=crop&q=80'
    },
    {
      id: 'abstract',
      name: 'Abstract Art',
      url: 'https://images.unsplash.com/photo-1506259091721-347e791bab0f?w=1920&h=1080&fit=crop&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1506259091721-347e791bab0f?w=300&h=200&fit=crop&q=80'
    }
  ];
};

// Upload wallpaper to cloud storage (placeholder for future implementation)
export const uploadWallpaper = async (file, token) => {
  try {
    // This would integrate with a cloud storage service like Cloudinary, AWS S3, etc.
    // For now, we'll convert to base64 as a fallback
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  } catch (error) {
    console.error('Error uploading wallpaper:', error);
    throw error;
  }
};

export default {
  getDesktop,
  updateIconPosition,
  updateDesktopIcons,
  updateWallpaper,
  validateImageUrl,
  getWallpaperPresets,
  uploadWallpaper
};