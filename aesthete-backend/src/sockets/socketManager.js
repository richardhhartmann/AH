const Message = require('../models/Message');
const Chat = require('../models/Chat');

const initSocket = (server) => {
    const allowedOrigins = ['http://localhost:3000', 'https://ah-three.vercel.app'];
    const io = require('socket.io')(server, {
        cors: { origin: allowedOrigins }
    });

    let activeUsers = {}; // Objeto para rastrear usuários online

    io.on('connection', (socket) => {
        console.log('Cliente conectado ao Socket.IO:', socket.id);

        // Usuário se junta a uma sala baseada no seu próprio ID e avisa que está online
        socket.on('setup', (userData) => {
            socket.join(userData._id);
            activeUsers[userData._id] = socket.id;
            io.emit('onlineUsers', Object.keys(activeUsers)); // Envia a lista de online para todos
            socket.emit('connected');
        });

        socket.on('joinChat', (room) => {
            socket.join(room);
        });

        // --- LÓGICA NOVA: "ESTÁ DIGITANDO" ---
        socket.on('typing', (room) => socket.in(room).emit('typing'));
        socket.on('stopTyping', (room) => socket.in(room).emit('stopTyping'));

        socket.on('newMessage', async (newMessageReceived) => {
            const chat = newMessageReceived.chat;
            if (!chat.participants) return console.log('Participantes do chat não definidos');

            try {
                const message = await Message.create({
                    sender: newMessageReceived.sender._id,
                    content: newMessageReceived.content,
                    chat: chat._id,
                });
                
                await Chat.findByIdAndUpdate(chat._id, { lastMessage: message });
                const fullMessage = await Message.findById(message._id)
                    .populate('sender', 'username avatar')
                    .populate('chat');

                chat.participants.forEach(user => {
                    if (user._id == newMessageReceived.sender._id) return;
                    socket.in(user._id).emit('messageReceived', fullMessage);
                });
            } catch (error) {
                console.error("Erro ao salvar ou emitir mensagem:", error);
            }
        });

        socket.on('disconnect', () => {
            console.log('Cliente desconectado:', socket.id);
            // Remove o usuário da lista de ativos quando ele desconectar
            for (let userId in activeUsers) {
                if (activeUsers[userId] === socket.id) {
                    delete activeUsers[userId];
                    break;
                }
            }
            io.emit('onlineUsers', Object.keys(activeUsers)); // Atualiza a lista de online para todos
        });
    });

    return io;
};

module.exports = { initSocket };