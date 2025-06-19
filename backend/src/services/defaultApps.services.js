import { App } from '../models/app.models.js';
import { FileSystem } from '../models/fileSystem.models.js';
import { Desktop } from '../models/desktop.models.js';
import { User } from '../models/user.models.js';

export const DEFAULT_APPS = [
  {
    name: 'file-explorer',
    displayName: 'File Explorer',
    type: 'system',
    category: 'system',
    icon: '/assets/icons/file-explorer.png',
    executable: 'FileExplorer',
    defaultSettings: {
      window: { width: 900, height: 600, minWidth: 600, minHeight: 400 },
      permissions: { fileSystem: true }
    }
  },
  {
    name: 'notepad',
    displayName: 'Notepad',
    type: 'system',
    category: 'productivity',
    icon: '/assets/icons/notepad.png',
    executable: 'Notepad',
    defaultSettings: {
      window: { width: 700, height: 500, minWidth: 400, minHeight: 300 },
      permissions: { fileSystem: true }
    }
  },
  {
    name: 'terminal',
    displayName: 'Terminal',
    type: 'system',
    category: 'development',
    icon: '/assets/icons/terminal.png',
    executable: 'Terminal',
    defaultSettings: {
      window: { width: 800, height: 400, minWidth: 500, minHeight: 200 },
      permissions: { fileSystem: true, system: true }
    }
  },
  {
    name: 'browser',
    displayName: 'Browser',
    type: 'system',
    category: 'productivity',
    icon: '/assets/icons/browser.png',
    executable: 'Browser',
    defaultSettings: {
      window: { width: 1000, height: 700, minWidth: 600, minHeight: 400 },
      permissions: { network: true }
    }
  },
  {
    name: 'my-computer',
    displayName: 'My Computer',
    type: 'system',
    category: 'system',
    icon: '/assets/icons/my-computer.png',
    executable: 'MyComputer',
    defaultSettings: {
      window: { width: 800, height: 600, minWidth: 500, minHeight: 400 },
      permissions: { fileSystem: true, system: true }
    }
  },
  {
    name: 'settings',
    displayName: 'Settings',
    type: 'system',
    category: 'system',
    icon: '/assets/icons/settings.png',
    executable: 'Settings',
    defaultSettings: {
      window: { width: 900, height: 650, minWidth: 600, minHeight: 500 },
      permissions: { system: true }
    }
  }
];

export const initializeSystemApps = async () => {
  try {
    for (const appData of DEFAULT_APPS) {
      await App.findOneAndUpdate(
        { name: appData.name },
        appData,
        { upsert: true, new: true }
      );
    }
    console.log('System apps initialized');
  } catch (error) {
    console.error('Error initializing system apps:', error);
  }
};

export const createUserDefaultFolders = async (userId) => {
  const defaultFolders = [
    { name: 'Documents', path: '/Documents' },
    { name: 'Downloads', path: '/Downloads' },
    { name: 'Pictures', path: '/Pictures' },
    { name: 'Videos', path: '/Videos' },
    { name: 'Music', path: '/Music' },
    { name: 'Desktop', path: '/Desktop' }
  ];

  try {
    for (const folder of defaultFolders) {
      await FileSystem.create({
        name: folder.name,
        type: 'folder',
        owner: userId,
        path: folder.path,
        parent: null
      });
    }
    console.log('Default folders created for user');
  } catch (error) {
    console.error('Error creating default folders:', error);
  }
};

export const createUserDesktop = async (userId) => {
  try {
    const apps = await App.find({ type: 'system' });
    const desktopIcons = apps.slice(0, 4).map((app, index) => ({
      appId: app._id,
      position: { x: 50 + (index % 2) * 100, y: 50 + Math.floor(index / 2) * 100 }
    }));

    const desktop = await Desktop.create({
      owner: userId,
      desktopIcons,
      taskbar: {
        pinnedApps: apps.slice(0, 3).map(app => app._id)
      }
    });

    await User.findByIdAndUpdate(userId, { desktopConfig: desktop._id });
    console.log('✅ Desktop configuration created');
    return desktop;
  } catch (error) {
    console.error('Error creating desktop configuration:', error);
  }
}; 