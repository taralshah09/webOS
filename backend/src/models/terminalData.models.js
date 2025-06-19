import mongoose from 'mongoose';

const terminalDataSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessions: [{
    sessionId: String,
    currentPath: { type: String, default: '/' },
    history: [{
      command: String,
      output: String,
      timestamp: { type: Date, default: Date.now },
      exitCode: { type: Number, default: 0 }
    }],
    environment: {
      type: Map,
      of: String,
      default: new Map([
        ['PATH', '/bin:/usr/bin'],
        ['HOME', '/home/user'],
        ['USER', 'user']
      ])
    }
  }],
  preferences: {
    theme: { type: String, default: 'dark' },
    fontSize: { type: Number, default: 14 },
    fontFamily: { type: String, default: 'Courier New' }
  }
});

export const TerminalData = mongoose.model('TerminalData', terminalDataSchema); 