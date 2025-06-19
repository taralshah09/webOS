import mongoose from 'mongoose';

const settingsDataSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  systemSettings: {
    display: {
      resolution: { type: String, default: 'auto' },
      scaling: { type: Number, default: 100 },
      orientation: { type: String, default: 'landscape' }
    },
    personalization: {
      theme: { type: String, default: 'windows' },
      accentColor: { type: String, default: '#0078d4' },
      wallpaper: { type: String, default: '/assets/wallpapers/default.jpg' }
    },
    system: {
      notifications: { type: Boolean, default: true },
      sounds: { type: Boolean, default: true },
      animations: { type: Boolean, default: true }
    }
  }
});

export const SettingsData = mongoose.model('SettingsData', settingsDataSchema); 