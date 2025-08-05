const mongoose = require('mongoose');

const StorySchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    mediaUrl: { type: String, required: true },
    mediaType: { type: String, enum: ['image', 'video'], default: 'image' },
    createdAt: { type: Date, default: Date.now },
    // Este campo diz ao MongoDB para deletar o documento 24h após sua criação
    expiresAt: { type: Date, default: () => new Date(Date.now() + 24*60*60*1000), index: { expires: '24h' } }
});

module.exports = mongoose.model('Story', StorySchema);