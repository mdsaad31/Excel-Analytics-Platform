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
    type: String, // This will store the user's ID from Auth0
    required: true,
  },
}, { timestamps: true });

const FileHistory = mongoose.model('FileHistory', fileHistorySchema);

module.exports = FileHistory;
