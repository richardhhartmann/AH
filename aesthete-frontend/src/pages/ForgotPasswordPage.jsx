import React, { useState } from 'react';
import axios from 'axios';

// (Você pode reutilizar os styled-components da LoginPage se quiser)

const ENDPOINT = process.env.REACT_APP_API_URL;

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('Enviando e-mail...');
        try {
            await axios.post(`${ENDPOINT}/api/auth/forgot-password`, { email });
            setMessage('Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha.');
        } catch (error) {
            setMessage('Ocorreu um erro. Tente novamente.');
        }
    };

    return (
        <div>
            <h2>Esqueceu sua senha?</h2>
            <p>Insira seu e-mail e enviaremos um link para você.</p>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Seu e-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <button type="submit">Enviar Link</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default ForgotPasswordPage;