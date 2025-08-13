// aesthete-backend/src/server.js 

const express = require('express');
const http = require('http');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const adRoutes = require('./routes/adRoutes');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const connectDB = require('./config/db');
const { initSocket } = require('./sockets/socketManager');
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const storyRoutes = require('./routes/storyRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

connectDB();

const app = express();
const server = http.createServer(app);
const io = initSocket(server);

const allowedOrigins = ['http://localhost:3000', 'https://ah-three.vercel.app'];
app.use(cors({
    origin: function (origin, callback) {
        // !! LINHA DE DEBUG !! Adicione esta linha para ver a URL que chega
        console.log('CORS: Requisição recebida da origem:', origin);

        // Sua lógica de verificação continua a mesma
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
}));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use((req, res, next) => {
    req.io = io;
    next();
});

app.get('/api', (req, res) => res.send('API da Aesthete está no ar!'));
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ads', adRoutes);

const PORT = process.env.PORT || 10000;

server.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});