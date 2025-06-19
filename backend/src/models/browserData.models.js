import mongoose from 'mongoose';

const browserDataSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tabs: [{
    url: String,
    title: String,
    favicon: String,
    isActive: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now }
  }],
  bookmarks: [{
    title: String,
    url: String,
    folder: { type: String, default: 'Bookmarks' },
    timestamp: { type: Date, default: Date.now }
  }],
  history: [{
    url: String,
    title: String,
    visitTime: { type: Date, default: Date.now }
  }],
  preferences: {
    homepage: { type: String, default: 'about:blank' },
    searchEngine: { type: String, default: 'google' }
  }
});

export const BrowserData = mongoose.model('BrowserData', browserDataSchema); 