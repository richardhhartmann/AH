const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../config/cloudinary');
const timeoutMiddleware = require('../middlewares/timeoutMiddleware'); // <-- 1. Importar

const { accessChat, fetchChats, fetchMessages, markChatAsRead, uploadAudioMessage, deleteChat } = require('../controllers/chatController');

const FIVE_MINUTES = 5 * 60 * 1000;

router.route('/').post(protect, accessChat); 
router.route('/').get(protect, fetchChats);
router.route('/:chatId/messages').get(protect, fetchMessages);
router.route('/:chatId/read').put(protect, markChatAsRead);

// --- 2. APLICAR O MIDDLEWARE AQUI ---
router.route('/upload-audio').post(protect, timeoutMiddleware(FIVE_MINUTES), upload.single('audio'), uploadAudioMessage);

router.route('/:chatId').delete(protect, deleteChat);

module.exports = router;