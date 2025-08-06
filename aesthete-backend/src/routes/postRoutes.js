const express = require('express');
const router = express.Router();
const { 
    createPost, 
    getFeedPosts, 
    likePost, 
    getPostById, 
    deletePost,
    addCommentToPost 
} = require('../controllers/postController');
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../config/cloudinary');

// Rota para criar um novo post.
router.post('/', protect, upload.single('media'), createPost);

// Rota para buscar o feed de posts
router.get('/feed', protect, getFeedPosts);

// Rota para buscar um post específico pelo ID
router.get('/:id', getPostById);

// Rota para deletar um post
router.delete('/:id', protect, deletePost);

// Rota para curtir/descurtir um post
router.post('/:id/like', protect, likePost);

// Rota para adicionar um comentário a um post
router.post('/:id/comment', protect, addCommentToPost);

module.exports = router;