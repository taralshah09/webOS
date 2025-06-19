import { App } from '../models/app.models.js';

const DEFAULT_APPS = [
  {
    name: 'file-explorer',
    displayName: 'File Explorer',
    type: 'system',
    category: 'system',
    icon: '🗂️',
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
    icon: '📝',
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
    icon: '💻',
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
    icon: '🌐',
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
    icon: '💻',
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
    icon: '⚙️',
    executable: 'Settings',
    defaultSettings: {
      window: { width: 900, height: 650, minWidth: 600, minHeight: 500 },
      permissions: { system: true }
    }
  }
];

export const initializeSystemApps = async () => {
  try {
    console.log('🔄 Initializing system apps...');
    
    for (const appData of DEFAULT_APPS) {
      await App.findOneAndUpdate(
        { name: appData.name },
        appData,
        { 
          upsert: true, 
          new: true,
          setDefaultsOnInsert: true
        }
      );
    }
    
    console.log('✅ System apps initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Error initializing system apps:', error);
    return false;
  }
};

export const getSystemApps = async () => {
  try {
    return await App.find({ type: 'system', isInstalled: true });
  } catch (error) {
    console.error('Error fetching system apps:', error);
    return [];
  }
};

export const updateIconPosition = async (req, res) => {
  try {
    const { iconId, position } = req.body;
    if (!iconId || !position) {
      return res.status(400).json({
        success: false,
        message: "iconId and position are required",
      });
    }
    // ... rest of your code ...
  } catch (error) {
    console.error('Error updating icon position:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating icon position',
    });
  }
};