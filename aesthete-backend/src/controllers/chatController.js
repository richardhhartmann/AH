const Chat = require('../models/Chat');
const User = require('../models/User');
const Message = require('../models/Message');
const Story = require('../models/Story');

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
        let chats = await Chat.find({ participants: { $elemMatch: { $eq: req.user.id } } })
            .populate('participants', '-password')
            .populate({
                path: 'lastMessage',
                populate: { path: 'sender', select: 'username' }
            })
            .sort({ updatedAt: -1 });

        const chatsWithUnread = await Promise.all(
            chats.map(async (chat) => {
                // --- AQUI ESTÁ A CORREÇÃO ---
                // Adicionamos a condição 'sender: { $ne: req.user.id }'
                const unreadCount = await Message.countDocuments({
                    chat: chat._id,
                    readBy: { $ne: req.user.id }, // Onde eu não li
                    sender: { $ne: req.user.id }  // E o remetente não sou eu
                });
                
                return { ...chat.toObject(), unreadCount };
            })
        );
        
        res.status(200).json(chatsWithUnread);
    } catch (error) {
        console.error("Erro ao buscar conversas:", error);
        res.status(400).json({ message: error.message });
    }
};

// @desc    Marcar todas as mensagens de um chat como lidas
// @route   PUT /api/chats/:chatId/read
exports.markChatAsRead = async (req, res) => {
    try {
        await Message.updateMany(
            { chat: req.params.chatId, readBy: { $ne: req.user.id } },
            { $addToSet: { readBy: req.user.id } } // Adiciona o ID do usuário ao array 'readBy'
        );
        res.status(200).json({ message: 'Mensagens marcadas como lidas.' });
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