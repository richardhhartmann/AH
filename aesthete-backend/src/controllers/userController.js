const User = require('../models/User');
const Post = require('../models/Post');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

// @desc    Buscar perfil de um usuário
// @route   GET /api/users/profile/:username
exports.getUserProfile = async (req, res) => {
    try {
        // --- LINHA MODIFICADA ---
        // Em vez de buscar pelo nome exato, usamos uma expressão regular
        // que busca pelo username ignorando o case (maiúsculas/minúsculas).
        const user = await User.findOne({ 
            username: { $regex: `^${req.params.username}$`, $options: 'i' } 
        }).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        const posts = await Post.find({ user: user._id }).sort({ createdAt: -1 });

        const isFollowing = req.user ? user.followers.includes(req.user.id) : false;

        res.json({
            user,
            posts,
            postCount: posts.length,
            followerCount: user.followers.length,
            followingCount: user.following.length,
            isFollowing
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
};

exports.updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (user) {
            user.username = req.body.username || user.username;
            user.email = req.body.email || user.email;
            user.bio = req.body.bio || user.bio;
            user.profession = req.body.profession || user.profession;

            // Se uma nova foto de perfil foi enviada
            if (req.file) {
                // Opcional: deletar a foto antiga se não for a padrão
                if (user.avatar && user.avatar !== 'default_avatar_url') {
                    const oldAvatarPath = path.join(__dirname, '..', '..', user.avatar);
                    if (fs.existsSync(oldAvatarPath)) {
                        fs.unlinkSync(oldAvatarPath);
                    }
                }
                user.avatar = '/' + req.file.path.replace(/\\/g, '/');
            }

            // Se uma nova senha foi fornecida
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
                // Retornamos um novo token caso o username ou outras infos importantes mudem
                token: jwt.sign({ id: updatedUser._id }, process.env.JWT_SECRET, { expiresIn: '30d' }),
            });
        } else {
            res.status(404).json({ message: 'Usuário não encontrado' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro no servidor' });
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
        const usersToExclude = [...currentUser.following, req.user.id];
        const users = await User.find({ _id: { $nin: usersToExclude } })
            .select('username avatar bio')
            .limit(10);
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro no servidor' });
    }
};