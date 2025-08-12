// aesthete-backend/src/server.js 

const express = require('express');
const http = require('http');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const adRoutes = require('./routes/adRoutes');

// Configure o dotenv PRIMEIRO
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// AGORA, importe os outros módulos
const connectDB = require('./config/db');
const { initSocket } = require('./sockets/socketManager');
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const storyRoutes = require('./routes/storyRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// Conecta ao Banco de Dados
connectDB();

const app = express();
const server = http.createServer(app);
const io = initSocket(server);

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
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// --- CORREÇÃO: MOVA ESTE BLOCO PARA CÁ ---
// Middleware para anexar 'io' a cada requisição.
// DEVE VIR ANTES DAS ROTAS para que req.io esteja disponível nelas.
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Rotas da API
app.get('/api', (req, res) => res.send('API da Aesthete está no ar!'));
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ads', adRoutes);

// Configuração do Servidor
const PORT = process.env.PORT || 10000;

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});