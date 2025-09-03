const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../config/cloudinary');
const timeoutMiddleware = require('../middlewares/timeoutMiddleware'); // <-- 1. Importar

const { 
    createPost, 
    getFeedPosts, 
    likePost, 
    getPostById, 
    deletePost,
    addCommentToPost,
    getExploreFeed
} = require('../controllers/postController');

const FIVE_MINUTES = 5 * 60 * 1000;

// Rota para o feed "Seguindo"
router.get('/feed', protect, getFeedPosts);

// Rota para o feed "Explorar"
router.get('/explore', protect, getExploreFeed);

// --- 2. APLICAR O MIDDLEWARE AQUI ---
router.post('/', protect, timeoutMiddleware(FIVE_MINUTES), upload.array('media', 10), createPost);

// Rota para buscar ou deletar um post específico
router.route('/:id')
    .get(getPostById)
    .delete(protect, deletePost);

// Rota para curtir um post
router.post('/:id/like', protect, likePost);

// Rota para adicionar um comentário
router.post('/:id/comment', protect, addCommentToPost);

module.exports = router;