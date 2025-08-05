const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); // Módulo nativo do Node.js
const sendEmail = require('../utils/sendEmail');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Registrar um novo usuário
// @route   POST /api/auth/register
exports.registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({ message: 'Usuário já existe' });
    }

    const user = await User.create({ username, email, password });

    if (user) {
        res.status(201).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            token: generateToken(user._id),
        });
    } else {
        res.status(400).json({ message: 'Dados inválidos' });
    }
};

// @desc    Autenticar usuário e obter token
// @route   POST /api/auth/login
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            username: user.username,
            avatar: user.avatar,
            token: generateToken(user._id),
        });
    } else {
        res.status(401).json({ message: 'E-mail ou senha inválidos' });
    }
};

// @desc    Esqueci a senha
// @route   POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            // Enviamos uma resposta de sucesso mesmo se o usuário não existir
            // para não revelar quais e-mails estão cadastrados no sistema.
            return res.status(200).json({ success: true, data: 'E-mail enviado' });
        }

        // Gera o token de redefinição
        const resetToken = crypto.randomBytes(20).toString('hex');

        // Salva o token criptografado e a data de expiração no banco
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // Expira em 10 minutos

        await user.save({ validateBeforeSave: false });

        // Cria a URL de redefinição que será enviada no e-mail
        const resetUrl = `${process.env.CLIENT_URL}/redefinir-senha/${resetToken}`;
        const message = `Você está recebendo este e-mail porque solicitou a redefinição de senha. Por favor, clique no link a seguir para prosseguir: \n\n ${resetUrl}`;

        await sendEmail({
            email: user.email,
            subject: 'Redefinição de Senha - Aesthete',
            message
        });
        
        res.status(200).json({ success: true, data: 'E-mail enviado' });

    } catch (error) {
        console.error(error);
        // Limpa os campos em caso de erro no envio do e-mail
        if (user) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save({ validateBeforeSave: false });
        }
        res.status(500).json({ message: 'Erro no envio do e-mail' });
    }
};

// @desc    Redefinir a senha
// @route   PUT /api/auth/reset-password/:resettoken
exports.resetPassword = async (req, res) => {
    try {
        // Pega o token criptografado da URL
        const resetPasswordToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() } // Verifica se o token não expirou
        });

        if (!user) {
            return res.status(400).json({ message: 'Token inválido ou expirado' });
        }

        // Define a nova senha
        user.password = req.body.password;
        // Limpa os campos do token para que ele não possa ser usado novamente
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.status(200).json({ success: true, data: 'Senha redefinida com sucesso' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro no servidor' });
    }
};