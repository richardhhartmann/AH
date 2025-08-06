const User = require('../models/User');
const Post = require('../models/Post');
const Story = require('../models/Story');
const Notification = require('../models/Notification');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

// @desc    Buscar perfil de um usuário
// @route   GET /api/users/profile/:username
exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findOne({ username: { $regex: `^${req.params.username}$`, $options: 'i' } }).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        const posts = await Post.find({ user: user._id }).sort({ createdAt: -1 });
        const activeStory = await Story.findOne({ user: user._id, expiresAt: { $gt: new Date() } });

        const isFollowing = req.user ? user.followers.includes(req.user.id) : false;

        res.json({
            user,
            posts,
            postCount: posts.length,
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
    try {
        const userToFollow = await User.findById(req.params.id);
        const currentUser = await User.findById(req.user.id);

        if (!userToFollow || !currentUser) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }
        
        if (req.params.id === req.user.id) {
            return res.status(400).json({ message: 'Você não pode seguir a si mesmo' });
        }

        // Se já está seguindo, vai deixar de seguir
        if (currentUser.following.includes(req.params.id)) {
            currentUser.following = currentUser.following.filter(id => id.toString() !== req.params.id);
            userToFollow.followers = userToFollow.followers.filter(id => id.toString() !== req.user.id);
        } else { // Se não, vai seguir
            currentUser.following.push(req.params.id);
            userToFollow.followers.push(req.user.id);
        }

        await currentUser.save();
        await userToFollow.save();

        res.json({ message: 'Operação realizada com sucesso' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro no servidor' });
    }

    if (!currentUser.following.includes(req.params.id)) {
    currentUser.following.push(req.params.id);
    userToFollow.followers.push(req.user.id);
    
    // Cria a notificação
    const notification = new Notification({
        recipient: userToFollow._id,
        sender: req.user.id,
        type: 'follow'
    });
    await notification.save();

    const populatedNotification = await Notification.findById(notification._id)
        .populate('sender', 'username avatar');

    req.io.to(userToFollow._id.toString()).emit('newNotification', populatedNotification);
    
}
};

// @desc    Atualizar o perfil do usuário
// @route   PUT /api/users/profile
exports.updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (user) {

            if (req.body.username && req.body.username !== '') {
                user.username = req.body.username;
            }

            if (req.body.email && req.body.email !== '' && req.body.email !== 'undefined') {
                user.email = req.body.email;
            }

            if ('bio' in req.body) {
                user.bio = req.body.bio;
            }
            if ('profession' in req.body) {
                user.profession = req.body.profession;
            }

            if (req.file) {
                user.avatar = req.file.path.replace('http://', 'https://');
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
            .populate('followers', 'username avatar'); // Popula o array 'followers'

        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }
        
        res.json(user.followers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro no servidor' });
    }
};

// @desc    Buscar a lista de usuários que um usuário segue
// @route   GET /api/users/:id/following
exports.getFollowing = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .populate('following', 'username avatar'); // Popula o array 'following'

        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }
        
        res.json(user.following);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro no servidor' });
    }
};

// @desc    Buscar sugestões de usuários para seguir
// @route   GET /api/users/suggestions
exports.getUserSuggestions = async (req, res) => {
    try {
        const currentUser = await User.findById(req.user.id);

        // --- ADIÇÃO DE SEGURANÇA ---
        // Se, por algum motivo, o usuário do token não for encontrado no DB,
        // retornamos um erro claro em vez de deixar o servidor quebrar.
        if (!currentUser) {
            return res.status(404).json({ message: 'Usuário logado não encontrado.' });
        }

        const usersToExclude = [...currentUser.following, req.user.id];

        const users = await User.find({ _id: { $nin: usersToExclude } })
            .select('username avatar bio')
            .limit(10);

        res.json(users);
    } catch (error) {
        // Adicionamos um log mais específico para futuras depurações
        console.error("ERRO EM getUserSuggestions:", error); 
        res.status(500).json({ message: 'Erro no servidor ao buscar sugestões.' });
    }
};