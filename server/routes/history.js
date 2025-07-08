const router = require('express').Router();
let FileHistory = require('../models/fileHistory.model');

router.route('/').get(async (req, res) => {
  try {
    const history = await FileHistory.find({ user: req.query.user });
    res.json(history);
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

router.route('/add').post(async (req, res) => {
  try {
    const { fileName, uploadDate, size, user } = req.body;

    const newFileHistory = new FileHistory({
      fileName,
      uploadDate,
      size,
      user,
    });

    await newFileHistory.save();
    res.json('File history added!');
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

router.route('/:id').delete(async (req, res) => {
  try {
    await FileHistory.findByIdAndDelete(req.params.id);
    res.json('File history deleted.');
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

module.exports = router;
