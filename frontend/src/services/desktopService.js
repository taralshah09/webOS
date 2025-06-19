const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/desktop';

export const getDesktop = async (token) => {
  const res = await fetch(`${API_URL}/`, {
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
  const res = await fetch(`${API_URL}/icons`, {
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
  const res = await fetch(`${API_URL}/icon-position`, {
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
  const res = await fetch(`${API_URL}/wallpaper`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
    body: JSON.stringify({ wallpaper })
  });
  if (!res.ok) throw new Error((await res.json()).message || 'Failed to update wallpaper');
  return res.json();
}; 