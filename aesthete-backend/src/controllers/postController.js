// postController.js

const Post = require('../models/Post');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Comment = require('../models/Comment');
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
        const post = await Post.findById(req.params.id)
            .populate('user', 'username avatar'); // Popula o autor do post

        if (!post) {
            return res.status(404).json({ message: 'Post não encontrado' });
        }

        // Buscar os comentários de forma separada, já populando os autores
        const comments = await Comment.find({ post: post._id }).populate('author', 'username avatar');

        res.json({ ...post.toObject(), comments }); // Retorna os comentários como array separado
    } catch (error) {
        console.error(error);
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
        const { text } = req.body;
        const postId = req.params.id;
        const authorId = req.user.id;

        const post = await Post.findById(postId).populate('user');

        if (!post) {
            return res.status(404).json({ message: 'Post não encontrado.' });
        }

        // Cria o novo comentário
        const newComment = new Comment({
            text: text,
            author: authorId,
            post: postId
        });
        await newComment.save();

        // Cria a notificação (se não for o dono do post)
        if (post.user._id.toString() !== authorId.toString()) {
            await Notification.create({
                sender: authorId,
                recipient: post.user._id,
                type: 'comment',
                post: postId
            });
        }

        // Popula o comentário recém-criado com os dados do autor
        const populatedComment = await Comment.findById(newComment._id).populate('author', 'username avatar');

        res.status(201).json(populatedComment);

    } catch (error) {
        console.error("Erro ao adicionar comentário:", error);
        res.status(500).json({ message: "Erro interno do servidor" });
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

