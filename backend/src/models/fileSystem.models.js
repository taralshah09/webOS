import mongoose from 'mongoose';

const fileSystemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['file', 'folder'],
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FileSystem',
    default: null
  },
  path: {
    type: String,
    required: true
  },
  content: {
    type: String,
    default: ''
  },
  mimeType: {
    type: String,
    default: 'text/plain'
  },
  size: {
    type: Number,
    default: 0
  },
  children: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FileSystem'
  }],
  permissions: {
    read: { type: Boolean, default: true },
    write: { type: Boolean, default: true },
    execute: { type: Boolean, default: false }
  },
  metadata: {
    created: { type: Date, default: Date.now },
    modified: { type: Date, default: Date.now },
    accessed: { type: Date, default: Date.now },
    hidden: { type: Boolean, default: false }
  }
}, {
  timestamps: true
});

fileSystemSchema.index({ owner: 1, parent: 1 });
fileSystemSchema.index({ owner: 1, path: 1 });
fileSystemSchema.index({ parent: 1, type: 1 });

fileSystemSchema.pre('save', function(next) {
  if (this.type === 'file' && this.content) {
    this.size = Buffer.byteLength(this.content, 'utf8');
  }
  this.metadata.modified = new Date();
  next();
});

fileSystemSchema.virtual('fullPath').get(async function() {
  if (!this.parent) return this.path;
  const parent = await this.model('FileSystem').findById(this.parent);
  return `${await parent.fullPath}/${this.name}`;
});

fileSystemSchema.statics.getRootFolders = function(userId) {
  return this.find({ 
    owner: userId, 
    parent: null, 
    type: 'folder' 
  });
};

export const FileSystem = mongoose.model('FileSystem', fileSystemSchema); 