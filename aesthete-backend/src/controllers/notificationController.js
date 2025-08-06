const Notification = require('../models/Notification');

// @desc    Buscar notificações do usuário logado
// @route   GET /api/notifications
exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user.id })
            .populate('sender', 'username avatar')
            .populate('post', 'mediaUrl')
            .sort({ createdAt: -1 });

        res.json(notifications);
    } catch (error) {
        console.error("Erro ao buscar notificações:", error);
        res.status(500).json({ message: 'Erro no servidor' });
    }
};

// @desc    Marcar notificações como lidas
// @route   PUT /api/notifications/read
exports.markNotificationsAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.user.id, read: false },
            { $set: { read: true } }
        );
        res.status(200).json({ success: true, message: 'Notificações marcadas como lidas.' });
    } catch (error) {
        console.error("Erro ao marcar notificações como lidas:", error);
        res.status(500).json({ message: 'Erro no servidor' });
    }
};