// Caminho: src/routes/userRoutes.js

const express = require('express');
const router = express.Router();
// Adicione a nova função importada
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware'); // Reutilizaremos o middleware de upload
const { getUserProfile, followUser, updateUserProfile, searchUsers, getFollowers, getFollowing } = require('../controllers/userController');

router.get('/search', protect, searchUsers);

router.get('/profile/:username', protect, getUserProfile);

router.get('/:id/followers', protect, getFollowers);

router.get('/:id/following', protect, getFollowing);

router.put('/follow/:id', protect, followUser);

router.put('/profile', protect, upload.single('avatar'), updateUserProfile);

module.exports = router;