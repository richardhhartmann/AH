const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    // 1. Verifica se o token existe no cabeçalho e se começa com "Bearer"
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // 2. Extrai o token (remove a palavra "Bearer ")
            token = req.headers.authorization.split(' ')[1];

            // 3. Verifica se o token é válido e decodifica o payload (que contém o ID)
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 4. Usa o ID do token para buscar o usuário no banco de dados, sem a senha
            req.user = await User.findById(decoded.id).select('-password');

            // 5. Se o usuário não for encontrado (ex: foi deletado), retorna erro
            if (!req.user) {
                return res.status(401).json({ message: 'Não autorizado, usuário não encontrado' });
            }

            // 6. SUCESSO! Passa para a próxima função (o controller)
            return next();

        } catch (error) {
            // 7. Se o token for inválido, expirado, ou houver qualquer erro, retorna 401
            console.error("Erro no middleware de proteção:", error.message);
            return res.status(401).json({ message: 'Não autorizado, token inválido' });
        }
    }

    // 8. Se não houver nenhum cabeçalho de autorização ou token, retorna 401
    if (!token) {
        return res.status(401).json({ message: 'Não autorizado, nenhum token fornecido' });
    }
};

module.exports = { protect };