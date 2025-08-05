// Caminho: src/server.js

const express = require('express');
const http = require('http');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const { initSocket } = require('./sockets/socketManager');


// Importação das rotas
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const storyRoutes = require('./routes/storyRoutes');

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();

// Conecta ao MongoDB
connectDB();

const app = express();

const allowedOrigins = ['http://localhost:3000', 'https://ah-three.vercel.app'];

// Middlewares essenciais
app.use(cors({
    origin: function (origin, callback) {
        // Permite requisições sem 'origin' (como de apps mobile ou Postman)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'A política de CORS para este site não permite acesso da Origem especificada.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    }
}));

app.use(express.json());

app.use('/uploads', express.static('uploads'));

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/stories', storyRoutes);

// Configuração do Servidor e Socket.IO
const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

initSocket(server);

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${PORT} e acessível na sua rede local`);
});