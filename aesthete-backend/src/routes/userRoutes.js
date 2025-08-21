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
    getUserSuggestions,
    getTopPosters,
    savePost,
    getSavedPosts
} = require('../controllers/userController');


router.get('/search', protect, searchUsers);

router.get('/suggestions', protect, getUserSuggestions);

router.get('/profile/:username', protect, getUserProfile);
router.put('/profile', protect, upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'banner', maxCount: 1 }
]), updateUserProfile);
router.put('/follow/:id', protect, followUser);
router.get('/:id/followers', protect, getFollowers);
router.get('/:id/following', protect, getFollowing);
router.get('/top-posters', protect, getTopPosters);
router.put('/save-post/:postId', protect, savePost);
router.get('/saved-posts', protect, getSavedPosts);

module.exports = router;