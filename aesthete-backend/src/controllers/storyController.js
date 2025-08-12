const Story = require('../models/Story');
const User = require('../models/User');
const cloudinary = require('cloudinary').v2; // Importe o SDK do Cloudinary

// @desc    Criar um novo story
// @route   POST /api/stories
exports.createStory = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Nenhum arquivo de mídia enviado.' });
        }

        const mediaUrl = req.file.path.replace('http://', 'https://');

        const story = new Story({
            mediaUrl,
            user: req.user.id
        });

        const createdStory = await story.save();
        res.status(201).json(createdStory);

    } catch (error) {
        console.error('ERRO AO CRIAR STORY:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

// @desc    Buscar os stories dos usuários que o usuário logado segue
// @route   GET /api/stories/feed
exports.getStoryFeed = async (req, res) => {
    try {
        const currentUser = await User.findById(req.user.id);

        const userIdsToSearch = [...currentUser.following, req.user.id];

        // Encontra stories dos usuários seguidos que ainda não expiraram
        const stories = await Story.find({
            user: { $in: userIdsToSearch }, // Usamos a nova lista na busca
            expiresAt: { $gt: new Date() }
        }).populate('user', 'username avatar');

        // Agrupa os stories por usuário
        const storiesByUser = stories.reduce((acc, story) => {
            const userId = story.user._id.toString();
            if (!acc[userId]) {
                acc[userId] = {
                    userId: story.user._id,
                    username: story.user.username,
                    avatar: story.user.avatar,
                    stories: []
                };
            }
            acc[userId].stories.push({
                _id: story._id,
                mediaUrl: story.mediaUrl,
                createdAt: story.createdAt
            });
            return acc;
        }, {});

        // Converte o objeto em um array
        res.json(Object.values(storiesByUser));

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar stories.' });
    }
};

// @desc    Buscar stories de um usuário específico
// @route   GET /api/stories/user/:userId
exports.getStoriesByUserId = async (req, res) => {
    try {
        const stories = await Story.find({
            user: req.params.userId,
            expiresAt: { $gt: new Date() }
        }).populate('user', 'username avatar');

        if (!stories || stories.length === 0) {
            return res.status(404).json({ message: 'Nenhum story ativo encontrado para este usuário.' });
        }
        
        const user = stories[0].user;
        const formattedData = {
            userId: user._id,
            username: user.username,
            avatar: user.avatar,
            // ALTERAÇÃO 1: Adicionado o 'createdAt' para consistência
            stories: stories.map(s => ({ 
                _id: s._id, 
                mediaUrl: s.mediaUrl, 
                createdAt: s.createdAt 
            }))
        };

        // ALTERAÇÃO 2 (A PRINCIPAL): Envolver o objeto em um array
        res.json([formattedData]);

    } catch (error) {
        res.status(500).json({ message: 'Erro no servidor' });
    }
};

exports.deleteStory = async (req, res) => {

    console.log('ID recebido no Backend:', req.params.id);

    try {
        const story = await Story.findById(req.params.id);

        if (!story) {
            return res.status(404).json({ message: 'Story não encontrado' });
        }

        if (story.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Não autorizado' });
        }

        const publicId = story.mediaUrl.split('/').pop().split('.')[0];
        
        if (publicId) {
            await cloudinary.uploader.destroy(publicId);
        }
        
        await story.deleteOne();

        res.json({ message: 'Story removido com sucesso' });

    } catch (error) {
        console.error("ERRO AO DELETAR STORY:", error);
        res.status(500).json({ message: 'Erro no servidor' });
    }
};

// @desc    Buscar um único story pelo ID
// @route   GET /api/stories/:id
exports.getStoryById = async (req, res) => {
    try {
        const story = await Story.findById(req.params.id).populate('user', 'username avatar');
        if (!story) {
            return res.status(404).json({ message: 'Story não encontrado' });
        }
        res.json(story);
    } catch (error) {
        res.status(500).json({ message: 'Erro no servidor' });
    }
};