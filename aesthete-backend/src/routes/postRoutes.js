// Crie este arquivo: src/routes/postRoutes.js

const express = require('express');
const router = express.Router();
const { createPost, getFeedPosts, likePost, getPostById, deletePost } = require('../controllers/postController');
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../config/cloudinary');
const { addCommentToPost } = require('../controllers/postController');


router.get('/feed', protect, getFeedPosts);

router.post('/:id/like', protect, likePost);
router.post('/', protect, upload.single('media'), createPost);

router.post('/', protect, createPost);

router.route('/:id').get(getPostById);

router.route('/:id').delete(protect, deletePost);

router.route('/:id/like').post(protect, likePost);

router.post('/:id/comment', protect, addCommentToPost);

module.exports = router;