const express = require('express');
const router = express.Router();

// 1. IMPORTAÇÕES
// Importe as funções do seu controller de anúncios.
// O nome do arquivo e das funções deve ser o mesmo que você criou.
const {
  createAd,
  getAllAds,
  registerAdClick
  // Adicione outras funções que você tenha, como getAdById, updateAd, etc.
} = require('../controllers/adController');

// Importe seu middleware de autenticação, se aplicável, para proteger rotas.
const { protect } = require('../middlewares/authMiddleware');


// 2. DEFINIÇÃO DAS ROTAS

// =================================================================
// ROTA PRINCIPAL - A ROTA QUE ESTÁVAMOS DEBUGANDO
// =================================================================
/**
 * @desc    Registra um clique em um anúncio
 * @route   POST /api/ads/:id/click
 * @access  Public
 */
router.post('/:id/click', registerAdClick);


// =================================================================
// OUTRAS ROTAS COMUNS PARA ANÚNCIOS (EXEMPLOS)
// =================================================================

/**
 * @desc    Obtém todos os anúncios para exibir no feed
 * @route   GET /api/ads
 * @access  Public ou Private (depende da sua regra de negócio)
 */
router.get('/', getAllAds);


/**
 * @desc    Cria um novo anúncio
 * @route   POST /api/ads
 * @access  Private (Apenas administradores ou usuários autenticados podem criar)
 */
router.post('/', protect, createAd); // Exemplo de rota protegida


// Adicione aqui outras rotas que você precisar, como:
// router.get('/:id', getAdById);       // Para ver detalhes de um anúncio
// router.put('/:id', protect, updateAd);  // Para editar um anúncio
// router.delete('/:id', protect, deleteAd); // Para remover um anúncio


// 3. EXPORTAÇÃO
// É essencial exportar o router para que ele possa ser usado no seu arquivo principal (server.js ou app.js)
module.exports = router;