// Importa o handler de erros assíncronos (se você o estiver usando)
const asyncHandler = require('express-async-handler');

// Importa o seu modelo Mongoose para anúncios
const Ad = require('../models/Ad');


// -----------------------------------------------------------------------------
// @desc    Registra um clique em um anúncio
// @route   POST /api/ads/:id/click
// @access  Public
// -----------------------------------------------------------------------------
const registerAdClick = asyncHandler(async (req, res) => {
  const adId = req.params.id;

  // Usa o método findByIdAndUpdate com o operador atômico $inc.
  // Esta é a forma mais eficiente e segura de incrementar um valor no MongoDB,
  // pois evita condições de corrida (race conditions).
  const ad = await Ad.findByIdAndUpdate(
    adId,
    { $inc: { clicks: 1 } }, // Incrementa o campo 'clicks' em +1
    { new: true } // Opcional: se você quisesse ver o documento atualizado
  );

  // Se nenhum anúncio com esse ID for encontrado, retorna um erro 404.
  if (!ad) {
    res.status(404);
    throw new Error('Anúncio não encontrado');
  }

  // Envia uma resposta de sucesso.
  res.status(200).json({ message: 'Clique registrado com sucesso' });
});


// -----------------------------------------------------------------------------
// @desc    Cria um novo anúncio
// @route   POST /api/ads
// @access  Private (protegido por middleware de autenticação)
// -----------------------------------------------------------------------------
const createAd = asyncHandler(async (req, res) => {
  // Pega os dados do corpo da requisição (enviados pelo frontend)
  const { companyName, headline, description, mediaUrl, callToAction } = req.body;

  // Validação simples para garantir que os campos obrigatórios foram enviados
  if (!companyName || !headline || !mediaUrl || !callToAction) {
    res.status(400); // 400 Bad Request
    throw new Error('Por favor, preencha todos os campos obrigatórios do anúncio.');
  }

  // Cria o anúncio no banco de dados
  const ad = await Ad.create({
    companyName,
    headline,
    description,
    mediaUrl,
    callToAction
  });

  // Se o anúncio for criado com sucesso, retorna os dados com status 201 (Created)
  if (ad) {
    res.status(201).json(ad);
  } else {
    res.status(400);
    throw new Error('Dados do anúncio inválidos.');
  }
});


// -----------------------------------------------------------------------------
// @desc    Obtém todos os anúncios
// @route   GET /api/ads
// @access  Public (ou Private, dependendo da sua necessidade)
// -----------------------------------------------------------------------------
const getAllAds = asyncHandler(async (req, res) => {
  // Busca todos os documentos da coleção 'ads' e os ordena pela data de criação (mais novos primeiro)
  const ads = await Ad.find({}).sort({ createdAt: -1 });

  res.status(200).json(ads);
});


// É FUNDAMENTAL exportar todas as funções para que as rotas possam usá-las.
module.exports = {
  registerAdClick,
  createAd,
  getAllAds,
};