const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    // O usuário que VAI RECEBER a notificação
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    // O usuário que CAUSOU a notificação (quem curtiu, seguiu, etc.)
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // O tipo de notificação
    type: { type: String, enum: ['like', 'comment', 'follow'], required: true },
    // O post relacionado (se for like ou comment)
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    // Status de leitura
    read: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Notification', NotificationSchema);