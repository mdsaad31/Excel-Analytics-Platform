const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const fileHistorySchema = new Schema({
  fileName: {
    type: String,
    required: true,
    trim: true,
  },
  uploadDate: {
    type: Date,
    required: true,
  },
  size: {
    type: String,
    required: true,
  },
  user: {
    type: String,
    required: true,
  },
  fileContent: {
    type: String, // Base64 encoded file content
    required: false,
  },
  parsedData: {
    sheets: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    headers: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    firstSheet: {
      type: String,
      default: '',
    },
  },
  fileType: {
    type: String,
    required: true,
    default: 'excel',
  },
  originalSize: {
    type: Number, // Size in bytes
    required: false,
  },
  fileHash: {
    type: String, // SHA-256 hash of file content for duplicate detection
    required: false,
    index: true, // Index for faster duplicate queries
  },
}, { timestamps: true });

const FileHistory = mongoose.model('FileHistory', fileHistorySchema);

module.exports = FileHistory;
