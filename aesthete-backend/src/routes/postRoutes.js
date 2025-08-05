// Crie este arquivo: src/routes/postRoutes.js

const express = require('express');
const router = express.Router();
const { createPost, getFeedPosts, likePost, getPostById, deletePost } = require('../controllers/postController');
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const { addCommentToPost } = require('../controllers/postController');

// Para o upload, vamos precisar de um middleware. Vamos chamá-lo de 'upload'.
// const upload = require('../middlewares/uploadMiddleware');

// Rota para obter o feed de postagens (protegida)
// GET /api/posts/feed
router.get('/feed', protect, getFeedPosts);

// Rota para curtir/descurtir um post (protegida)
// POST /api/posts/:id/like
router.post('/:id/like', protect, likePost);
router.post('/', protect, upload.single('media'), createPost);

// Rota para criar um novo post (protegida)
// POST /api/posts
// NOTA: A linha abaixo está comentada porque ainda precisamos criar o uploadMiddleware
// router.post('/', protect, upload.single('media'), createPost);

// Por enquanto, vamos criar uma rota de teste sem upload de imagem
router.post('/', protect, createPost);

// A rota GET não precisa ser protegida, pois posts podem ser públicos
router.route('/:id').get(getPostById);
// A rota DELETE precisa ser protegida para sabermos quem está tentando deletar
router.route('/:id').delete(protect, deletePost);

router.route('/:id/like').post(protect, likePost);

router.post('/:id/comment', protect, addCommentToPost);

module.exports = router;