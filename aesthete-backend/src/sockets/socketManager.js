const Message = require('../models/Message');
const Chat = require('../models/Chat');

const initSocket = (server) => {
    const allowedOrigins = ['http://localhost:3000', 'https://ah-three.vercel.app'];

    const io = require('socket.io')(server, {
        cors: {
            origin: allowedOrigins,
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log('Cliente conectado ao Socket.IO:', socket.id);

        // Usuário se junta a uma sala baseada no seu próprio ID
        socket.on('setup', (userData) => {
            socket.join(userData._id);
            socket.emit('connected');
        });

        // Usuário entra em uma sala de chat específica
        socket.on('joinChat', (room) => {
            socket.join(room);
            console.log("Usuário entrou na sala: " + room);
        });

        // Recebe uma nova mensagem
        socket.on('newMessage', async (newMessageReceived) => {
            let chat = newMessageReceived.chat;

            if (!chat.participants) return console.log('Participantes do chat não definidos');

            // Salva a mensagem no banco de dados
            try {
                const message = await Message.create({
                    sender: newMessageReceived.sender._id,
                    content: newMessageReceived.content,
                    chat: chat._id,
                });
                
                // Atualiza a última mensagem do chat
                await Chat.findByIdAndUpdate(chat._id, { lastMessage: message });

                // Prepara a mensagem para ser enviada aos outros usuários
                const fullMessage = await Message.findById(message._id)
                    .populate('sender', 'username avatar')
                    .populate('chat');

                // Envia a mensagem para todos os participantes na sala do chat
                chat.participants.forEach(user => {
                    // Não envia a mensagem de volta para quem mandou
                    if (user._id == newMessageReceived.sender._id) return;
                    
                    socket.in(user._id).emit('messageReceived', fullMessage);
                });
            } catch (error) {
                console.error("Erro ao salvar ou emitir mensagem:", error);
            }
        });

        socket.on('disconnect', () => {
            console.log('Cliente desconectado:', socket.id);
        });
    });
    return io;
};

module.exports = { initSocket };