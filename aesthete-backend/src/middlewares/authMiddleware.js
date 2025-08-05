const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Pega o token do header (ex: "Bearer eyJhbGci...")
            token = req.headers.authorization.split(' ')[1];

            // Verifica o token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Pega o usuário do token e anexa à requisição (sem a senha)
            req.user = await User.findById(decoded.id).select('-password');

            next(); // Continua para a próxima etapa
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Não autorizado, token falhou' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Não autorizado, sem token' });
    }
};

module.exports = { protect };