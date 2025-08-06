// Caminho: src/routes/userRoutes.js

const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../config/cloudinary');

const { 
    getUserProfile, 
    followUser, 
    updateUserProfile, 
    searchUsers, 
    getFollowers, 
    getFollowing,
    getUserSuggestions
} = require('../controllers/userController');


router.get('/search', protect, searchUsers);

router.get('/suggestions', protect, getUserSuggestions);

router.get('/profile/:username', protect, getUserProfile);
router.put('/profile', protect, upload.single('avatar'), updateUserProfile);
router.put('/follow/:id', protect, followUser);
router.get('/:id/followers', protect, getFollowers);
router.get('/:id/following', protect, getFollowing);

module.exports = router;