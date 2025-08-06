// aesthete-backend/src/server.js (VERSÃO CORRIGIDA E FINAL)

const express = require('express');
const http = require('http');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path'); // Importe o módulo 'path' do Node.js

// 1. Configure o dotenv PRIMEIRO, especificando o caminho correto do arquivo .env
// que está na pasta raiz do backend, um nível acima da pasta 'src'.
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// 2. AGORA, importe os outros módulos que dependem das variáveis de ambiente.
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
// Servir arquivos estáticos da pasta 'uploads'
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rotas da API
app.get('/api', (req, res) => res.send('API da Aesthete está no ar!'));
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes); // Rota de Posts
app.use('/api/stories', storyRoutes); // Rota de Stories
app.use('/api/users', userRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/notifications', notificationRoutes);

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