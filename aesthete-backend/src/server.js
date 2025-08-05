const express = require('express');
const http = require('http');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const { initSocket } = require('./sockets/socketManager');

const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const storyRoutes = require('./routes/storyRoutes');

dotenv.config();
connectDB();

const app = express();

app.use(cors({ origin: "https://ah-three.vercel.app" }));

app.use(express.json());

app.use('/uploads', express.static('uploads'));

app.get('/api', (req, res) => res.send('API da Aesthete está no ar!'));
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/stories', storyRoutes);

const PORT = process.env.PORT || 10000;
const server = http.createServer(app);
initSocket(server);

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});