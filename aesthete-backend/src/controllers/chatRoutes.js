const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { accessChat, fetchChats, fetchMessages } = require('../controllers/chatController');

router.route('/').post(protect, accessChat);
router.route('/').get(protect, fetchChats);
router.route('/:chatId/messages').get(protect, fetchMessages);

module.exports = router;