const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../config/cloudinary');
const timeoutMiddleware = require('../middlewares/timeoutMiddleware'); // <-- 1. Importar

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

const FIVE_MINUTES = 5 * 60 * 1000;

router.get('/search', protect, searchUsers);
router.get('/suggestions', protect, getUserSuggestions);
router.get('/profile/:username', protect, getUserProfile);

// --- 2. APLICAR O MIDDLEWARE AQUI ---
router.put('/profile', protect, timeoutMiddleware(FIVE_MINUTES), upload.fields([
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