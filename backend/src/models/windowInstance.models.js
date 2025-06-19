import mongoose from 'mongoose';

const windowInstanceSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  app: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'App',
    required: true
  },
  position: {
    x: { type: Number, default: 100 },
    y: { type: Number, default: 100 }
  },
  size: {
    width: { type: Number, default: 800 },
    height: { type: Number, default: 600 }
  },
  state: {
    type: String,
    enum: ['normal', 'minimized', 'maximized'],
    default: 'normal'
  },
  zIndex: {
    type: Number,
    default: 1000
  },
  appData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

windowInstanceSchema.index({ owner: 1, app: 1 });

export const WindowInstance = mongoose.model('WindowInstance', windowInstanceSchema); 