import mongoose from 'mongoose';

const notepadDataSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  windowInstance: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WindowInstance'
  },
  documents: [{
    filename: String,
    content: String,
    lastSaved: { type: Date, default: Date.now },
    filePath: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FileSystem'
    }
  }],
  preferences: {
    fontSize: { type: Number, default: 14 },
    fontFamily: { type: String, default: 'Consolas' },
    wordWrap: { type: Boolean, default: true }
  }
});

export const NotepadData = mongoose.model('NotepadData', notepadDataSchema); 