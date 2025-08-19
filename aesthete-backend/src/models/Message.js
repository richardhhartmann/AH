const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    chat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat',
        required: true
    },
    storyPreview: {
        mediaUrl: { type: String }
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    readBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    content: { type: String, trim: true }, // URL para áudio/imagem, ou texto
    contentType: {
        type: String,
        enum: ['text', 'audio'],
        default: 'text'
    },
    audioDuration: { type: Number } // Em segundos
}, { timestamps: true });

module.exports = mongoose.model('Message', MessageSchema);