// Caminho: src/routes/postRoutes.js 

const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../config/cloudinary');

// Importando TODAS as funções necessárias
const { 
    createPost, 
    getFeedPosts, 
    likePost, 
    getPostById, 
    deletePost,
    addCommentToPost,
    getExploreFeed // <-- Importa a nova função
} = require('../controllers/postController');

// Rota para o feed "Seguindo"
router.get('/feed', protect, getFeedPosts);

// Rota para o feed "Explorar"
router.get('/explore', protect, getExploreFeed); // <-- ADICIONA A NOVA ROTA

// Rota para criar um novo post
router.post('/', protect, upload.single('media'), createPost);

// Rota para buscar ou deletar um post específico
router.route('/:id')
    .get(getPostById)
    .delete(protect, deletePost);

// Rota para curtir um post
router.post('/:id/like', protect, likePost);

// Rota para adicionar um comentário
router.post('/:id/comment', protect, addCommentToPost);

module.exports = router;