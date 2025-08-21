// aesthete-backend/src/controllers/userController.js

const User = require('../models/User');
const Post = require('../models/Post');
const Story = require('../models/Story');
const Notification = require('../models/Notification');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

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

// @desc    Buscar perfil de um usuário
// @route   GET /api/users/profile/:username
exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findOne({ username: { $regex: `^${req.params.username}$`, $options: 'i' } }).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        const postsFromDb = await Post.find({ user: user._id }).sort({ createdAt: -1 });
        
        const savedPostsFromDb = await Post.find({ _id: { $in: user.savedPosts } })
            .populate('user', 'username avatar')
            .sort({ createdAt: -1 });

        const posts = standardizePostMedia(postsFromDb);
        const savedPosts = standardizePostMedia(savedPostsFromDb);

        const activeStory = await Story.findOne({ user: user._id, expiresAt: { $gt: new Date() } });

        let photoCount = 0;
        let videoCount = 0;
        posts.forEach(post => {
            if (post.media && post.media.some(m => m.mediaType === 'video')) {
                videoCount++;
            }
            // A lógica foi ajustada para contar corretamente posts com fotos
            if (post.media && post.media.some(m => m.mediaType === 'image')) {
                photoCount++;
            }
        });

        const isFollowing = req.user ? user.followers.includes(req.user.id) : false;

        res.json({
            user,
            posts,
            savedPosts,
            postCount: posts.length,
            photoCount,
            videoCount,
            followerCount: user.followers.length,
            followingCount: user.following.length,
            isFollowing,
            hasActiveStory: !!activeStory
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro no servidor' });
    }
};

// @desc    Seguir / Deixar de seguir um usuário
// @route   PUT /api/users/follow/:id
exports.followUser = async (req, res) => {
    const userIdToFollow = req.params.id;
    const followerId = req.user.id;

    if (userIdToFollow === followerId) {
        return res.status(400).json({ message: "Você não pode seguir a si mesmo." });
    }

    try {
        const userToFollow = await User.findById(userIdToFollow);
        const follower = await User.findById(followerId);

        if (!userToFollow || !follower) {
            return res.status(404).json({ message: "Usuário não encontrado." });
        }

        const isAlreadyFollowing = follower.following.includes(userIdToFollow);

        if (isAlreadyFollowing) {
            await User.findByIdAndUpdate(followerId, { $pull: { following: userIdToFollow } });
            await User.findByIdAndUpdate(userIdToFollow, { $pull: { followers: followerId } });
            res.status(200).json({ message: "Deixou de seguir o usuário." });
        } else {
            await User.findByIdAndUpdate(followerId, { $addToSet: { following: userIdToFollow } });
            await User.findByIdAndUpdate(userIdToFollow, { $addToSet: { followers: followerId } });
            await Notification.create({
                sender: followerId,
                recipient: userIdToFollow,
                type: 'follow'
            });
            res.status(200).json({ message: "Usuário seguido com sucesso." });
        }
    } catch (error) {
        console.error("Erro no processo de seguir/deixar de seguir:", error);
        res.status(500).json({ message: "Erro interno do servidor." });
    }
};

exports.deleteUserAccount = async (req, res) => {
    try {
        const userId = req.user.id;
        await Post.deleteMany({ user: userId });
        await User.findByIdAndDelete(userId);
        res.json({ message: 'Conta e dados associados removidos com sucesso.' });
    } catch (error) {
        console.error("Erro ao deletar conta:", error);
        res.status(500).json({ message: "Erro no servidor." });
    }
};

// @desc    Atualizar o perfil do usuário
// @route   PUT /api/users/profile
exports.updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (user) {
            user.username = req.body.username || user.username;
            user.email = req.body.email || user.email;
            user.bio = req.body.bio || user.bio;
            user.profession = req.body.profession || user.profession;

            if (req.files) {
                if (req.files.avatar) {
                    user.avatar = req.files.avatar[0].path.replace('http://', 'https://');
                }
                if (req.files.banner) {
                    user.banner = req.files.banner[0].path.replace('http://', 'https://');
                }
            }

            if (req.body.password) {
                user.password = req.body.password;
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                username: updatedUser.username,
                email: updatedUser.email,
                bio: updatedUser.bio,
                avatar: updatedUser.avatar,
                banner: updatedUser.banner,
                profession: updatedUser.profession,
                token: jwt.sign({ id: updatedUser._id }, process.env.JWT_SECRET, { expiresIn: '30d' }),
            });
        } else {
            res.status(404).json({ message: 'Usuário não encontrado' });
        }
    } catch (error) {
        console.error("ERRO AO ATUALIZAR PERFIL:", error);
        res.status(500).json({ message: 'Erro no servidor ao atualizar o perfil.' });
    }
};

exports.searchUsers = async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) {
            return res.json([]);
        }
        const users = await User.find({
            username: { $regex: query, $options: 'i' }
        })
        .select('username avatar')
        .limit(10);
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro no servidor' });
    }
};

exports.getFollowers = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .populate('followers', 'username avatar profession'); 
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }
        res.json(user.followers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro no servidor' });
    }
};

exports.getFollowing = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .populate('following', 'username avatar profession');
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }
        res.json(user.following);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro no servidor' });
    }
};

exports.getUserSuggestions = async (req, res) => {
    try {
        const currentUser = await User.findById(req.user.id);
        if (!currentUser) {
            return res.status(404).json({ message: 'Usuário logado não encontrado.' });
        }
        const usersToExclude = [...currentUser.following, req.user.id];
        const users = await User.find({ _id: { $nin: usersToExclude } })
            .select('username avatar bio')
            .limit(10);
        res.json(users);
    } catch (error) {
        console.error("ERRO EM getUserSuggestions:", error);
        res.status(500).json({ message: 'Erro no servidor ao buscar sugestões.' });
    }
};

// @desc    Busca os usuários com mais postagens
// @route   GET /api/users/top-posters
exports.getTopPosters = async (req, res) => {
    try {
        const topPosters = await Post.aggregate([
            { $group: { _id: '$user', postCount: { $sum: 1 } } },
            // --- CORREÇÃO APLICADA AQUI ---
            // Alterado de $gt: 1 para $gt: 0 para incluir usuários com apenas 1 post
            { $match: { postCount: { $gt: 0 } } },
            { $sort: { postCount: -1 } },
            { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'userDetails' } },
            { $project: { _id: 0, postCount: 1, user: { $arrayElemAt: ['$userDetails', 0] } } }
        ]);

        const sanitizedPosters = topPosters.map(item => {
            if (item.user) {
                delete item.user.password;
                delete item.user.email;
            }
            return item;
        });
        
        res.json(sanitizedPosters);
    } catch (error) {
        console.error("Erro ao buscar top posters:", error);
        res.status(500).json({ message: 'Erro no servidor' });
    }
};

exports.savePost = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const postId = req.params.postId;

        if (user.savedPosts.includes(postId)) {
            await user.updateOne({ $pull: { savedPosts: postId } });
            res.json({ message: 'Post removido dos salvos.' });
        } else {
            await user.updateOne({ $addToSet: { savedPosts: postId } });
            res.json({ message: 'Post salvo com sucesso.' });
        }
    } catch (error) {
        console.error("Erro ao salvar o post:", error);
        res.status(500).json({ message: 'Erro no servidor' });
    }
};

exports.getSavedPosts = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        const savedPosts = await Post.find({
            '_id': { $in: user.savedPosts }
        })
        .populate('user', 'username avatar') 
        .sort({ createdAt: -1 });

        res.json(savedPosts);
    } catch (error) {
        console.error("Erro ao buscar posts salvos:", error);
        res.status(500).json({ message: 'Erro no servidor' });
    }
};