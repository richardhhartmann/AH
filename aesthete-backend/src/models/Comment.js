// models/Comment.js

const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    // O texto do comentário
    text: {
        type: String,
        required: [true, 'O texto do comentário é obrigatório.'],
        trim: true
    },
    // Referência ao usuário que fez o comentário
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Cria uma ligação com o modelo 'User'
        required: true
    },
    // Referência à publicação que o comentário pertence
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post', // Cria uma ligação com o modelo 'Post'
        required: true
    }
}, {
    // Adiciona os campos createdAt e updatedAt automaticamente
    timestamps: true 
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;