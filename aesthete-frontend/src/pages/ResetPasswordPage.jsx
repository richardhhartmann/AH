import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ResetPasswordPage = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const { resettoken } = useParams(); // Pega o token da URL
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setMessage('As senhas não coincidem!');
            return;
        }

        try {
            await axios.put(`http://localhost:5000/api/auth/reset-password/${resettoken}`, { password });
            setMessage('Senha redefinida com sucesso! Redirecionando para o login...');
            setTimeout(() => navigate('/login'), 3000);
        } catch (error) {
            setMessage(error.response.data.message || 'Token inválido ou expirado.');
        }
    };

    return (
        <div>
            <h2>Redefinir Senha</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="password"
                    placeholder="Nova senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Confirme a nova senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />
                <button type="submit">Redefinir Senha</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default ResetPasswordPage;