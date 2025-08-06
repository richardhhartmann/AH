const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

const { 
    createStory, 
    getStoryFeed, 
    getStoriesByUserId, 
    deleteStory
} = require('../controllers/storyController');

router.route('/feed').get(protect, getStoryFeed);
router.route('/').post(protect, upload.single('media'), createStory);
router.route('/user/:userId').get(protect, getStoriesByUserId);

router.route('/:id').delete(protect, deleteStory);

module.exports = router;