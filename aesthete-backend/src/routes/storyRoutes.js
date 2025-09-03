const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../config/cloudinary');
const timeoutMiddleware = require('../middlewares/timeoutMiddleware'); // <-- 1. Importar

const { 
    createStory, 
    getStoryFeed, 
    getStoriesByUserId, 
    deleteStory,
    likeStory,
    replyToStory
} = require('../controllers/storyController');

const FIVE_MINUTES = 5 * 60 * 1000;

router.route('/feed').get(protect, getStoryFeed);

// --- 2. APLICAR O MIDDLEWARE AQUI ---
router.route('/').post(protect, timeoutMiddleware(FIVE_MINUTES), upload.single('media'), createStory);

router.route('/user/:userId').get(protect, getStoriesByUserId);
router.route('/:id/like').put(protect, likeStory);
router.route('/:id/reply').post(protect, replyToStory);
router.route('/:id').delete(protect, deleteStory);

module.exports = router;