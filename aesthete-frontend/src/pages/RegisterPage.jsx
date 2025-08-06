import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { register, reset } from '../features/auth/authSlice'; // Criaremos isso a seguir

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        profession: '',
    });

    const { username, email, password, profession } = formData;

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { user, isLoading, isError, isSuccess, message } = useSelector(
        (state) => state.auth
    );

    useEffect(() => {
        if (isError) {
            alert(message); // Ou usar um componente de Toast/Snackbar
        }
        if (isSuccess || user) {
            navigate('/'); // Redireciona para o feed após o sucesso
        }
        dispatch(reset());
    }, [user, isError, isSuccess, message, navigate, dispatch]);


    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    const onSubmit = (e) => {
        e.preventDefault();
        const userData = { username, email, password, profession }; // <-- Adicione aqui
        dispatch(register(userData));
    };
    
    if (isLoading) {
        return <p>Carregando...</p>;
    }

    return (
        <div>
            <h1>Criar Conta na Aesthete</h1>
            <form onSubmit={onSubmit}>
                <input
                    type="text"
                    name="username"
                    value={username}
                    placeholder="Nome de usuário"
                    onChange={onChange}
                    required
                />
                <input
                    type="email"
                    name="email"
                    value={email}
                    placeholder="E-mail"
                    onChange={onChange}
                    required
                />
                <input
                    type="password"
                    name="password"
                    value={password}
                    placeholder="Senha"
                    onChange={onChange}
                    required
                />
                <select name="profession" value={profession} onChange={onChange} required>
                    <option value="" disabled>Selecione sua profissão</option>
                    <option value="Especialista em Posicionamento">Especialista em Posicionamento</option>
                    <option value="Biomédico">Biomédico</option>
                    <option value="Programador">Programador</option>
                    <option value="Esteticista">Esteticista</option>
                    <option value="Dermatologista">Dermatologista</option>
                    {/* Adicione as outras opções aqui */}
                </select>
                <button type="submit">Cadastrar</button>
            </form>
        </div>
    );
};

export default RegisterPage;