const mongoose = require('mongoose');

const fileHistorySchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: true,
  },
  uploadDate: {
    type: Date,
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
  user: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.models.FileHistory || mongoose.model('FileHistory', fileHistorySchema);
