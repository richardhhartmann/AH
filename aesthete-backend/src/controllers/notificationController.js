const Notification = require('../models/Notification');

// @desc    Buscar notificações do usuário logado
// @route   GET /api/notifications
exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user.id })
            .populate('sender', 'username avatar')
            .populate('post', 'mediaUrl')
            .sort({ createdAt: -1 }); // Mais recentes primeiro

        res.json(notifications);
    } catch (error) {
        console.error("Erro ao buscar notificações:", error);
        res.status(500).json({ message: 'Erro no servidor' });
    }
};