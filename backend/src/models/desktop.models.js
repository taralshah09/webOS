import mongoose from 'mongoose';

const desktopSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  wallpaper: {
    type: String,
    default: '/assets/wallpapers/default.jpg'
  },
  desktopIcons: [{
    appId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'App'
    },
    position: {
      x: { type: Number, default: 50 },
      y: { type: Number, default: 50 }
    },
    visible: {
      type: Boolean,
      default: true
    }
  }],
  taskbar: {
    position: {
      type: String,
      enum: ['top', 'bottom', 'left', 'right'],
      default: 'bottom'
    },
    pinnedApps: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'App'
    }],
    autoHide: {
      type: Boolean,
      default: false
    }
  },
  openWindows: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WindowInstance'
  }]
}, {
  timestamps: true
});

desktopSchema.index({ owner: 1 });

export const Desktop = mongoose.model('Desktop', desktopSchema); 