const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const savedChartSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  chartType: {
    type: String,
    required: true,
    enum: ['bar', 'line', 'area', 'pie', 'radar', 'scatter', 'treemap', 'composed'],
  },
  chartConfig: {
    xAxis: String,
    yAxis: [String],
    chartData: [{
      type: mongoose.Schema.Types.Mixed, // Allow flexible data structure
    }],
    colors: [String],
    startRow: Number,
    endRow: Number,
    activeSheet: String,
  },
  chartImageData: {
    type: String, // Base64 encoded image data
    required: false,
  },
  fileName: {
    type: String,
    required: true,
  },
  user: {
    type: String, // This will store the user's ID from Auth0
    required: true,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  isPublic: {
    type: Boolean,
    default: false,
  },
  likes: [{
    type: String, // User IDs who liked this chart
  }],
  downloads: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

// Index for faster queries
savedChartSchema.index({ user: 1, createdAt: -1 });
savedChartSchema.index({ user: 1, chartType: 1 });

const SavedChart = mongoose.model('SavedChart', savedChartSchema);

module.exports = SavedChart;
