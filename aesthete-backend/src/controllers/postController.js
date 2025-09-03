// aesthete-backend/src/controllers/postController.js

const mongoose = require('mongoose');
const Post = require('../models/Post');
const User = require('../models/User');
const Ad = require('../models/Ad');
const Notification = require('../models/Notification');
const Comment = require('../models/Comment');
const cloudinary = require('cloudinary').v2;

// ... (as outras funções do controller, como createPost, likePost, etc., permanecem as mesmas)

const standardizePostMedia = (posts) => {
    return posts.map(post => {
        const postObj = post.toObject ? post.toObject() : post;
        if ((!postObj.media || postObj.media.length === 0) && postObj.mediaUrl) {
            return {
                ...postObj,
                media: [{
                    url: postObj.mediaUrl,
                    mediaType: 'image'
                }]
            };
        }
        return postObj;
    });
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
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        const userIds = [...currentUser.following.map(id => id.toString()), req.user.id];
        const totalPosts = await Post.countDocuments({ user: { $in: userIds } });

        let posts = await Post.find({ user: { $in: userIds } })
            .populate('user', 'username avatar profession')
            .populate({
                path: 'comments',
                perDocumentLimit: 2,
                options: { sort: { createdAt: -1 } },
                populate: { path: 'author', select: 'username avatar' }
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(); 

        const postsWithCounts = await Promise.all(posts.map(async (post) => {
            const postDoc = await Post.findById(post._id).select('comments');
            return {
                ...post,
                isSaved: currentUser.savedPosts.includes(post._id),
                commentsCount: postDoc.comments.length
            };
        }));
        
        let standardizedPosts = standardizePostMedia(postsWithCounts);

        res.json({
            posts: standardizedPosts,
            currentPage: page,
            totalPages: Math.ceil(totalPosts / limit),
            totalPosts,
        });

    } catch (error) {
        console.error('Erro CRÍTICO ao buscar o feed:', error);
        res.status(500).json({ message: 'Erro ao buscar o feed.' });
    }
};

// @desc    Obter o feed de "Explorar" (PAGINADO)
// @route   GET /api/posts/explore
exports.getExploreFeed = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 15;
        const skip = (page - 1) * limit;

        const loggedInUser = await User.findById(req.user.id);
        if (!loggedInUser) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }
        const usersToExclude = [loggedInUser._id, ...loggedInUser.following];

        const totalPosts = await Post.countDocuments({ user: { $nin: usersToExclude } });
        
        // --- CORREÇÃO APLICADA AQUI ---
        // Adicionamos o populate de comentários, igual ao do feed "Seguindo"
        const posts = await Post.find({ user: { $nin: usersToExclude } })
            .populate('user', 'username avatar profession')
            .populate({
                path: 'comments',
                perDocumentLimit: 2,
                options: { sort: { createdAt: -1 } },
                populate: { path: 'author', select: 'username avatar' }
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const postsWithCounts = await Promise.all(posts.map(async (post) => {
            const postDoc = await Post.findById(post._id).select('comments');
            return {
                ...post,
                isSaved: loggedInUser.savedPosts.includes(post._id),
                commentsCount: postDoc.comments.length
            };
        }));
        // --- FIM DA CORREÇÃO ---

        let standardizedPosts = standardizePostMedia(postsWithCounts);

        res.json({
            posts: standardizedPosts,
            currentPage: page,
            totalPages: Math.ceil(totalPosts / limit),
            totalPosts,
        });
    } catch (error) {
        console.error("Erro ao buscar o feed explorar:", error);
        res.status(500).json({ message: 'Erro ao buscar o feed.' });
    }
};

exports.createPost = async (req, res) => {
    try {
        const { caption } = req.body;

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'Nenhum ficheiro de mídia enviado.' });
        }

        const mediaFiles = req.files.map(file => {
            return {
                url: file.path.replace('http://', 'https://'),
                mediaType: file.mimetype.startsWith('video') ? 'video' : 'image'
            };
        });

        const post = new Post({
            caption,
            media: mediaFiles,
            user: req.user.id
        });

        const createdPost = await post.save();
        res.status(201).json(createdPost);

    } catch (error) {
        console.error('ERRO AO CRIAR POST:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao criar o post.' });
    }
};

exports.likePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).select('likes user');

        if (!post) {
            return res.status(404).json({ message: 'Post não encontrado' });
        }

        const userId = req.user.id;
        const isLiked = post.likes.includes(userId);

        if (isLiked) {
            post.likes = post.likes.filter(id => id.toString() !== userId.toString());
        } else {
            post.likes.push(userId);
            
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

exports.getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        .populate('user', 'username avatar profession')
        .populate({
                path: 'comments',
                populate: {
                    path: 'author',
                    select: 'username avatar'
                }
            });

        if (!post) {
            return res.status(404).json({ message: 'Post não encontrado' });
        }
        
        let isSaved = false;
        if (req.user) {
            const loggedInUser = await User.findById(req.user.id);
            if (loggedInUser && loggedInUser.savedPosts) {
                isSaved = loggedInUser.savedPosts.includes(post._id);
            }
        }

        const postWithSavedStatus = {
            ...post.toObject(),
            isSaved
        };

        res.json(postWithSavedStatus);

    } catch (error) {
        console.error("Erro ao buscar post por ID:", error);
        res.status(500).json({ message: 'Erro no servidor' });
    }
};

exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post não encontrado' });
        }

        if (post.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Não autorizado' });
        }
        
        // Itera sobre o array de media para apagar cada ficheiro do Cloudinary
        if (post.media && post.media.length > 0) {
            for (const mediaItem of post.media) {
                const publicIdWithFolder = mediaItem.url.split('/').slice(-2).join('/').split('.')[0];
                if (publicIdWithFolder) {
                    const resourceType = mediaItem.mediaType === 'video' ? 'video' : 'image';
                    await cloudinary.uploader.destroy(publicIdWithFolder, { resource_type: resourceType });
                }
            }
        }

        await Comment.deleteMany({ post: post._id });
        await Notification.deleteMany({ post: post._id });
        await post.deleteOne();

        res.json({ message: 'Post e dados associados removidos com sucesso' });

    } catch (error) {
        console.error("Erro ao deletar post:", error);
        res.status(500).json({ message: 'Erro no servidor' });
    }
};

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

        post.comments.push(newComment._id);
        await post.save();

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