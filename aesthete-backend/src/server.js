const express = require('express');
const http = require('http');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const { initSocket } = require('./sockets/socketManager');

// Importação de todas as nossas rotas
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

// Configuração de CORS flexível para aceitar tanto o ambiente local quanto o de produção
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
app.use('/uploads', express.static('uploads'));

// --- ROTAS DA API ---

// Rota de teste para verificar se a API está online
app.get('/api', (req, res) => {
    res.send('API da Aesthete está no ar!');
});

// Rotas principais da aplicação
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/stories', storyRoutes);


// --- CONFIGURAÇÃO DO SERVIDOR ---
const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Inicializa o Socket.IO com o servidor http
initSocket(server);

// Inicia o servidor para aceitar conexões de qualquer endereço (importante para deploy e rede local)
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${PORT} e acessível na sua rede`);
});