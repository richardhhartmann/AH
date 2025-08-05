const express = require('express');
const router = express.Router();
const { createStory, getStoryFeed } = require('../controllers/storyController');
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.route('/feed').get(protect, getStoryFeed);
router.route('/').post(protect, upload.single('media'), createStory);

module.exports = router;