const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');

// Importe todas as funções necessárias do controller
const { accessChat, fetchChats, fetchMessages, markChatAsRead, uploadAudioMessage } = require('../controllers/chatController');
const upload = require('../config/cloudinary'); // Importe o upload

// Rota para iniciar ou acessar um chat
router.route('/').post(protect, accessChat);

// Rota para buscar todos os chats do usuário
router.route('/').get(protect, fetchChats);

// Rota para buscar todas as mensagens de um chat específico
router.route('/:chatId/messages').get(protect, fetchMessages);
router.route('/:chatId/read').put(protect, markChatAsRead);
router.route('/upload-audio').post(protect, upload.single('audio'), uploadAudioMessage);


// Exporte o roteador diretamente, sem chaves
module.exports = router;