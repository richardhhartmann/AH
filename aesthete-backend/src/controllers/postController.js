// postController.js

const Post = require('../models/Post');
const User = require('../models/User');
const Ad = require('../models/Ad');
const Notification = require('../models/Notification');
const Comment = require('../models/Comment');
const cloudinary = require('cloudinary').v2; // << ADICIONADO: Importa o Cloudinary

// As funções createPost e getFeedPosts permanecem como estão.
// @desc    Criar um novo post
// @route   POST /api/posts
exports.createPost = async (req, res) => {
    try {
        const { caption } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: 'Nenhum arquivo de imagem enviado.' });
        }

        const mediaUrl = req.file.path.replace('http://', 'https://');

        const post = new Post({
            caption,
            mediaUrl,
            mediaType: 'image',
            user: req.user.id
        });

        const createdPost = await post.save();
        res.status(201).json(createdPost);

    } catch (error) {
        console.error('ERRO AO CRIAR POST:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao criar o post.' });
    }
};

// @desc    Obter o feed de postagens que o usuário segue (PAGINADO)
// @route   GET /api/posts/feed
exports.getFeedPosts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const skip = (page - 1) * limit;
        
        const currentUser = await User.findById(req.user.id);
        if (!currentUser) {
            console.log('DEBUG: Usuário não encontrado no banco de dados!');
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        const userIds = [...currentUser.following, req.user.id];

        const totalPosts = await Post.countDocuments({ user: { $in: userIds } });
        const posts = await Post.find({ user: { $in: userIds } })
            .populate('user', 'username avatar')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        if (posts.length > 0) {
            console.log('DEBUG: Estrutura do primeiro post ANTES de ser enviado:', posts[0]);
        }

        res.json({
            posts,
            currentPage: page,
            totalPages: Math.ceil(totalPosts / limit),
            totalPosts,
        });

    } catch (error) {
        console.error('Erro CRÍTICO ao buscar o feed:', error);
        res.status(500).json({ message: 'Erro ao buscar o feed.' });
    }
};

// @desc    Curtir ou descurtir um post
// @route   POST /api/posts/:id/like
// --- LÓGICA DE LIKE CORRIGIDA ---
exports.likePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post não encontrado' });
        }

        const userId = req.user.id;
        const isLiked = post.likes.includes(userId);

        if (isLiked) {
            // Descurtir: Remove o ID do usuário do array de likes
            post.likes = post.likes.filter(id => id.toString() !== userId.toString());
        } else {
            // Curtir: Adiciona o ID do usuário ao array de likes
            post.likes.push(userId);
            
            // Cria notificação apenas ao curtir, e se não for o próprio post
            if (post.user.toString() !== userId.toString()) {
                const notification = new Notification({
                    recipient: post.user,
                    sender: userId,
                    type: 'like',
                    post: post._id
                });
                await notification.save();
            }
        }

        await post.save();
        res.json({ message: 'Interação registrada com sucesso' });

    } catch (error) {
        console.error("Erro em likePost:", error);
        res.status(500).json({ message: "Erro no servidor" });
    }
};

// Sua função getPostById já está correta para resolver o problema dos comentários!
exports.getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('user', 'username avatar') // Popula o autor do post
            .populate({ // Popula os comentários e os autores dos comentários
                path: 'comments',
                populate: {
                    path: 'author',
                    select: 'username avatar'
                }
            });

        if (!post) {
            return res.status(404).json({ message: 'Post não encontrado' });
        }

        // O 'post' já vem com os comentários populados, não precisamos fazer outra busca.
        res.json(post);

    } catch (error) {
        console.error("Erro ao buscar post por ID:", error);
        res.status(500).json({ message: 'Erro no servidor' });
    }
};

// @desc    Deletar um post
// @route   DELETE /api/posts/:id
// --- LÓGICA DE DELETE CORRIGIDA ---
exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post não encontrado' });
        }

        if (post.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Não autorizado' });
        }

        // Deleta a imagem do Cloudinary
        const publicId = post.mediaUrl.split('/').pop().split('.')[0];
        if (publicId) {
            await cloudinary.uploader.destroy(publicId);
        }

        // Deleta os comentários associados ao post
        await Comment.deleteMany({ post: post._id });
        
        // Deleta as notificações associadas ao post
        await Notification.deleteMany({ post: post._id });

        // Deleta o post do banco de dados
        await post.deleteOne();

        res.json({ message: 'Post e dados associados removidos com sucesso' });

    } catch (error) {
        console.error("Erro ao deletar post:", error);
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

        const newComment = new Comment({
            text: text,
            author: authorId,
            post: postId
        });
        await newComment.save();

        // --- ADICIONE ESTAS DUAS LINHAS ---
        // Adiciona a referência do novo comentário ao array de comentários do post
        post.comments.push(newComment._id);
        await post.save(); // Salva o post atualizado com o novo comentário

        // Cria a notificação (se não for o dono do post)
        if (post.user._id.toString() !== authorId.toString()) {
            await Notification.create({
                sender: authorId,
                recipient: post.user._id,
                type: 'comment',
                post: postId
            });
        }
        
        const populatedComment = await Comment.findById(newComment._id).populate('author', 'username avatar');

        res.status(201).json(populatedComment);

    } catch (error) {
        console.error("Erro ao adicionar comentário:", error);
        res.status(500).json({ message: "Erro interno do servidor" });
    }
};

// @desc    Obter o feed de "Explorar" (PAGINADO)
// @route   GET /api/posts/explore
exports.getExploreFeed = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 15; // O Explorar pode carregar mais posts
        const skip = (page - 1) * limit;

        const loggedInUser = await User.findById(req.user.id);
        if (!loggedInUser) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }
        const usersToExclude = [loggedInUser._id, ...loggedInUser.following];

        const totalPosts = await Post.countDocuments({ user: { $nin: usersToExclude } });
        const posts = await Post.find({ user: { $nin: usersToExclude } })
            .populate('user', 'username avatar')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        // Retorna o mesmo formato estruturado para consistência
        res.json({
            posts,
            currentPage: page,
            totalPages: Math.ceil(totalPosts / limit),
            totalPosts,
        });
    } catch (error) {
        console.error("Erro ao buscar o feed explorar:", error);
        res.status(500).json({ message: 'Erro ao buscar o feed.' });
    }
};
