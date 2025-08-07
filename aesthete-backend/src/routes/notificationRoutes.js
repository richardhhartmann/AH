const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { getNotifications, markNotificationsAsRead } = require('../controllers/notificationController');

router.get('/', protect, getNotifications); 

router.route('/read').put(protect, markNotificationsAsRead); // <-- ADICIONE ESTA ROTA

module.exports = router;