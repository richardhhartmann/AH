const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    avatar: { type: String, default: '/uploads/avatars/default.jpg' },
    bio: { type: String, maxlength: 150, default: '' },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    profession: {
        type: String,
        enum: [
            "Especialista em Posicionamento",
            "Biomédico",
            "Programador",
            "Esteticista",
            "Dermatologista",
            "Designer de Sobrancelhas",
            "Maquiador(a)",
            "Fisioterapeuta Dermatofuncional",
            "Micropigmentador(a)",
            "Cabeleireiro(a)"
        ]
    },
}, { timestamps: true });

// Criptografar senha antes de salvar
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Método para comparar senhas
UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);