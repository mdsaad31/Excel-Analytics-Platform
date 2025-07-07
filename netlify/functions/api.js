const express = require('express');
const mongoose = require('mongoose');
const serverless = require('serverless-http');
const cors = require('cors');
require('dotenv').config();

const app = express();
const router = express.Router();

app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URI;

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB database connection established successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

const fileHistorySchema = new mongoose.Schema({
  fileName: { type: String, required: true, trim: true },
  uploadDate: { type: Date, required: true },
  size: { type: String, required: true },
  user: { type: String, required: true },
}, { timestamps: true });

const FileHistory = mongoose.model('FileHistory', fileHistorySchema);

router.get('/', async (req, res) => {
  try {
    const history = await FileHistory.find({ user: req.query.user });
    res.json(history);
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

router.post('/add', async (req, res) => {
  try {
    const { fileName, uploadDate, size, user } = req.body;
    const newFileHistory = new FileHistory({ fileName, uploadDate, size, user });
    await newFileHistory.save();
    res.json('File history added!');
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await FileHistory.findByIdAndDelete(req.params.id);
    res.json('File history deleted.');
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

app.use('/api/history', router);

module.exports.handler = serverless(app);