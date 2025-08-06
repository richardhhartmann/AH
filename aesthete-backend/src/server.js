// Caminho: src/server.js (VERSÃO FINAL COMPLETA)

const express = require('express');
const http = require('http');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const { initSocket } = require('./sockets/socketManager');

// Importação de TODAS as rotas
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const storyRoutes = require('./routes/storyRoutes');
const notificationRoutes = require('./routes/notificationRoutes'); // <-- GARANTA QUE ESTÁ AQUI

dotenv.config();
connectDB();

const app = express();

// Configuração de CORS
const allowedOrigins = ['http://localhost:3000', 'https://ah-three.vercel.app'];
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
}));

// Middlewares essenciais
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Rotas da API
app.get('/api', (req, res) => res.send('API da Aesthete está no ar!'));
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/notifications', notificationRoutes); // <-- GARANTA QUE ESTÁ AQUI

// Configuração do Servidor
const PORT = process.env.PORT || 10000;
const server = http.createServer(app);
const io = initSocket(server);

// Middleware para anexar 'io' a cada requisição
app.use((req, res, next) => {
    req.io = io;
    next();
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});