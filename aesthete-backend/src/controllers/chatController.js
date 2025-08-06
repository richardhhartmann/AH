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

// @desc    Fazer upload de uma mensagem de áudio
// @route   POST /api/chats/upload-audio
exports.uploadAudioMessage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Nenhum arquivo de áudio enviado.' });
        }

        // --- MUDANÇA PRINCIPAL ---
        // Pegamos o chatId E a duration que o frontend nos enviou.
        const { chatId, duration } = req.body;
        if (!chatId) {
            return res.status(400).json({ message: 'ID do Chat não fornecido.' });
        }

        const message = await Message.create({
            sender: req.user.id,
            content: req.file.path.replace('http://', 'https://'),
            chat: chatId,
            contentType: 'audio',
            audioDuration: Math.round(duration) // Usamos a duração vinda do frontend
        });

        await Chat.findByIdAndUpdate(chatId, { lastMessage: message });

        // --- AQUI ESTÁ A CORREÇÃO ---
        // Usamos um 'populate' aninhado para buscar os detalhes dos participantes
        const fullMessage = await Message.findById(message._id)
            .populate('sender', 'username avatar')
            .populate({
                path: 'chat',
                populate: {
                    path: 'participants',
                    select: 'username avatar' // Seleciona os campos que precisamos dos participantes
                }
            });

        // Agora, 'fullMessage.chat.participants' é uma lista de objetos de usuário completos
        fullMessage.chat.participants.forEach(user => {
            if (user._id.toString() !== req.user.id.toString()) {
                req.io.to(user._id.toString()).emit('messageReceived', fullMessage);
            }
        });
        
        res.status(201).json(fullMessage);

    } catch (error) {
        console.error("Erro ao fazer upload do áudio:", error);
        res.status(500).json({ message: 'Erro no servidor' });
    }
};