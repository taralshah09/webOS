import mongoose from 'mongoose';

const appSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  displayName: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['system', 'user'],
    default: 'system'
  },
  category: {
    type: String,
    enum: ['productivity', 'system', 'entertainment', 'development'],
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  executable: {
    type: String,
    required: true
  },
  defaultSettings: {
    window: {
      width: { type: Number, default: 800 },
      height: { type: Number, default: 600 },
      minWidth: { type: Number, default: 400 },
      minHeight: { type: Number, default: 300 },
      resizable: { type: Boolean, default: true },
      maximizable: { type: Boolean, default: true }
    },
    permissions: {
      fileSystem: { type: Boolean, default: false },
      network: { type: Boolean, default: false },
      system: { type: Boolean, default: false }
    }
  },
  version: {
    type: String,
    default: '1.0.0'
  },
  isInstalled: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export const App = mongoose.model('App', appSchema); 