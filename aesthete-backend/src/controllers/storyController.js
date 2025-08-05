const Story = require('../models/Story');
const User = require('../models/User');

// @desc    Criar um novo story
// @route   POST /api/stories
exports.createStory = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Nenhum arquivo de mídia enviado.' });
        }

        const mediaUrl = '/' + req.file.path.replace(/\\/g, '/');

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
        const followingIds = currentUser.following;

        // Encontra stories dos usuários seguidos que ainda não expiraram
        const stories = await Story.find({
            user: { $in: followingIds },
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