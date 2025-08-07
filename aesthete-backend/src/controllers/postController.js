const Post = require('../models/Post');
const User = require('../models/User');
const Notification = require('../models/Notification');
const fs = require('fs');
const path = require('path');

// @desc    Criar um novo post
// @route   POST /api/posts
exports.createPost = async (req, res) => {
    // 1. Envolvemos tudo em um try...catch para não travar o servidor
    try {
        const { caption } = req.body; // A legenda vem do corpo do formulário

        // 2. Verificamos se um arquivo foi realmente enviado
        if (!req.file) {
            return res.status(400).json({ message: 'Nenhum arquivo de imagem enviado.' });
        }

        // 3. Pegamos o caminho do arquivo salvo pelo multer
        // O req.file.path pode vir com barras invertidas (\) no Windows. Convertemos para barras normais (/) para consistência de URL.
        const mediaUrl = req.file.path.replace('http://', 'https://');

        const post = new Post({
            caption,
            mediaUrl, // Usamos a variável que acabamos de criar
            mediaType: 'image', // Por enquanto, apenas imagens
            user: req.user.id // Pego do middleware 'protect'
        });

        const createdPost = await post.save();
        res.status(201).json(createdPost);

    } catch (error) {
        console.error('ERRO AO CRIAR POST:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao criar o post.' });
    }
};

// @desc    Obter o feed de postagens
// @route   GET /api/posts/feed
exports.getFeedPosts = async (req, res) => {
    try {
        const currentUser = await User.findById(req.user.id);
        const userIds = [...currentUser.following, req.user.id];

        const posts = await Post.find({ user: { $in: userIds } })
            .populate('user', 'username avatar') 
            .sort({ createdAt: -1 })
            .limit(20);

        res.json(posts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar o feed.' });
    }
};

// @desc    Curtir um post
// @route   POST /api/posts/:id/like
exports.likePost = async (req, res) => {
    const post = await Post.findById(req.params.id);

    if (post) {
        if (post.likes.includes(req.user.id)) {
            // Descurtir
            post.likes = post.likes.filter(id => id.toString() !== req.user.id.toString());
        } else {
            // Curtir
            post.likes.push(req.user.id);
        }
        await post.save();
        res.json({ message: 'Interação registrada' });
    } else {
        res.status(404).json({ message: 'Post não encontrado' });
    }

    if (!post.likes.includes(req.user.id)) {
        post.likes.push(req.user.id);

        // Só cria notificação se não for o próprio post
        if (post.user.toString() !== req.user.id) {
            const notification = new Notification({
                recipient: post.user,
                sender: req.user.id,
                type: 'like',
                post: post._id
            });
            await notification.save();
        }
    }
};

exports.getPostById = async (req, res) => {
    try {
        // A mágica acontece aqui, no '.populate()'
        // Pedimos para o Mongoose buscar o post e, para cada comentário,
        // ir na coleção 'users' e pegar o 'username' e 'avatar' do autor.
        const post = await Post.findById(req.params.id)
            .populate('user', 'username avatar') // Popula o autor do POST
            .populate('comments.user', 'username avatar'); // Popula o autor de CADA COMENTÁRIO

        if (!post) {
            return res.status(404).json({ message: 'Post não encontrado' });
        }

        res.json(post);
    } catch (error) {
        console.error(error);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Post não encontrado' });
        }
        res.status(500).json({ message: 'Erro no servidor' });
    }
};

// @desc    Deletar um post
// @route   DELETE /api/posts/:id
exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post não encontrado' });
        }

        // Verifica se o usuário que está fazendo a requisição é o dono do post
        if (post.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Não autorizado' });
        }

        // Deleta o arquivo de mídia da pasta /uploads
        const imagePath = path.join(__dirname, '..', '..', post.mediaUrl);
        fs.unlink(imagePath, (err) => {
            if (err) {
                console.error("Erro ao deletar o arquivo de imagem:", err);
                // Não bloqueamos a operação se o arquivo não for encontrado, mas registramos o erro
            }
        });

        await post.deleteOne();

        res.json({ message: 'Post removido com sucesso' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro no servidor' });
    }
};

// @desc    Adicionar um comentário a um post
// @route   POST /api/posts/:id/comment
exports.addCommentToPost = async (req, res) => {
    try {
        // req.user.id vem do middleware 'protect'
        const user = req.user;
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ message: 'O texto do comentário não pode estar vazio.' });
        }

        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post não encontrado' });
        }

        const newComment = {
            text: text,
            user: user.id,
            // O Mongoose usará o 'ref' para popular o username e avatar depois
        };

        post.comments.push(newComment);

        await post.save();

        // Para retornar o comentário com os dados do usuário populados
        const populatedPost = await Post.findById(post._id)
                                         .populate('comments.user', 'username avatar');

        // Retorna apenas o último comentário adicionado (que já vem com os dados do usuário)
        const addedComment = populatedPost.comments[populatedPost.comments.length - 1];

        res.status(201).json(addedComment);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro no servidor' });
    }
};

// @desc    Obter o feed de "Explorar" com todos os posts
// @route   GET /api/posts/explore
exports.getExploreFeed = async (req, res) => {
    try {
        const posts = await Post.find({}) // Busca todos os posts, sem filtro
            .populate('user', 'username avatar')
            .sort({ createdAt: -1 })
            .limit(50); // Limita para não sobrecarregar

        res.json(posts);
    } catch (error) {
        console.error("Erro ao buscar o feed explorar:", error);
        res.status(500).json({ message: 'Erro ao buscar o feed.' });
    }
};