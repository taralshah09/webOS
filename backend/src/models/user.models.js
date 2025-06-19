import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  profile: {
    displayName: {
      type: String,
      default: function() { return this.username; }
    },
    avatar: {
      type: String,
      default: 'https://tinyurl.com/mr2mpjsk'
    }
  },
  desktopConfig: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Desktop'
  },
  preferences: {
    theme: {
      type: String,
      enum: ['windows', 'dark', 'light', 'macos'],
      default: 'windows'
    },
    language: {
      type: String,
      default: 'en'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tokens: [{
    token: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

userSchema.index({ username: 1, email: 1 });

export const User = mongoose.model('User', userSchema); 