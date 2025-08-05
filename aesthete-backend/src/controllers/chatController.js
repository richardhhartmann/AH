const Chat = require('../models/Chat');
const User = require('../models/User');
const Message = require('../models/Message');

// @desc    Iniciar uma nova conversa ou buscar uma existente
// @route   POST /api/chats
exports.accessChat = async (req, res) => {
    const { userId } = req.body; // ID do outro usuário

    if (!userId) {
        return res.status(400).json({ message: 'UserId não fornecido' });
    }

    let isChat = await Chat.findOne({
        participants: { $all: [req.user.id, userId] }
    })
    .populate('participants', '-password')
    .populate('lastMessage');

    if (isChat) {
        res.send(isChat);
    } else {
        const chatData = {
            participants: [req.user.id, userId],
        };

        try {
            const createdChat = await Chat.create(chatData);
            const fullChat = await Chat.findOne({ _id: createdChat._id }).populate('participants', '-password');
            res.status(200).json(fullChat);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
};

// @desc    Buscar todas as conversas do usuário logado
// @route   GET /api/chats
exports.fetchChats = async (req, res) => {
    try {
        Chat.find({ participants: { $elemMatch: { $eq: req.user.id } } })
            .populate('participants', '-password')
            .populate('lastMessage')
            .sort({ updatedAt: -1 })
            .then(async (results) => {
                // Aqui podemos popular o sender da última mensagem
                results = await User.populate(results, {
                    path: "lastMessage.sender",
                    select: "username avatar email",
                });
                res.status(200).send(results);
            });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Buscar todas as mensagens de uma conversa
// @route   GET /api/chats/:chatId/messages
exports.fetchMessages = async (req, res) => {
    try {
        const messages = await Message.find({ chat: req.params.chatId })
            .populate('sender', 'username avatar')
            .populate('chat');
        res.json(messages);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};