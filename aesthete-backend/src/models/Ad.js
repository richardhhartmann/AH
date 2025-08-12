// Caminho: aesthete-backend/src/models/Ad.js

const mongoose = require('mongoose');

const adSchema = new mongoose.Schema({
    companyName: { type: String, required: true },
    mediaUrl: { type: String, required: true }, // URL da imagem ou vídeo
    headline: { type: String, required: true },  // Título do anúncio
    description: { type: String },              // Texto do anúncio
    callToAction: {
        text: { type: String, required: true, default: 'Saiba Mais' },
        url: { type: String, required: true },
    },
    status: {
        type: String,
        enum: ['active', 'paused'],
        default: 'active',
    },
    // Métricas simples para rastreamento
    metrics: {
        impressions: { type: Number, default: 0 },
        clicks: { type: Number, default: 0 },
    },
}, { timestamps: true });

module.exports = mongoose.model('Ad', adSchema);