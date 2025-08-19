// Em storyRoutes.js

const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../config/cloudinary');

const { 
    createStory, 
    getStoryFeed, 
    getStoriesByUserId, 
    deleteStory,
    likeStory,
    replyToStory // <-- 1. IMPORTE O NOVO CONTROLLER
} = require('../controllers/storyController');

router.route('/feed').get(protect, getStoryFeed);
router.route('/').post(protect, upload.single('media'), createStory);
router.route('/user/:userId').get(protect, getStoriesByUserId);

router.route('/:id/like').put(protect, likeStory);
router.route('/:id/reply').post(protect, replyToStory); // <-- 2. ADICIONE A NOVA ROTA
router.route('/:id').delete(protect, deleteStory);

module.exports = router;