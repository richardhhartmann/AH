import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';
// Importaremos uma nova ação do Redux que vamos criar
// import { updateUserProfile } from '../features/auth/authSlice';

const ENDPOINT = process.env.REACT_APP_API_URL;

const EditProfileContainer = styled.div`
    max-width: 600px;
    margin: 20px auto;
    padding: 20px;
    background-color: #fff;
    border: 1px solid #dbdbdb;
    border-radius: 8px;
`;

const FormGroup = styled.div`
    margin-bottom: 20px;
    label {
        display: block;
        font-weight: bold;
        margin-bottom: 5px;
    }
    input, textarea {
        width: 100%;
        padding: 8px;
        border: 1px solid #dbdbdb;
        border-radius: 4px;
    }
`;

const EditProfilePage = () => {
    const { user: currentUser } = useSelector((state) => state.auth);
    const navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [bio, setBio] = useState('');
    const [password, setPassword] = useState('');
    const [avatar, setAvatar] = useState(null);

    useEffect(() => {
        if (currentUser) {
            setUsername(currentUser.username);
            setEmail(currentUser.email);
            setBio(currentUser.bio || '');
        }
    }, [currentUser]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('username', username);
        formData.append('email', email);
        formData.append('bio', bio);
        if (password) formData.append('password', password);
        if (avatar) {
            formData.append('avatar', avatar); // <-- O NOME DO CAMPO DEVE SER 'avatar'
        }
        
        try {
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${currentUser.token}`,
                }
            };
            // Lógica para chamar a API e atualizar o estado do Redux viria aqui
            const { data } = await axios.put(`${ENDPOINT}/api/users/profile`, formData, config);
            
            // Atualizar o localStorage e o estado do Redux (IMPORTANTE!)
            localStorage.setItem('user', JSON.stringify(data));
            // dispatch(updateUserProfile(data)); // Ação do Redux (a ser criada)

            alert('Perfil atualizado com sucesso!');
            navigate(`/perfil/${data.username}`);

        } catch (error) {
            console.error("Erro ao atualizar o perfil", error);
            alert("Falha ao atualizar o perfil.");
        }
    };

    return (
        <EditProfileContainer>
            <h2>Editar Perfil</h2>
            <form onSubmit={handleSubmit}>
                <FormGroup>
                    <label htmlFor="avatar">Foto de Perfil</label>
                    <input type="file" id="avatar" onChange={(e) => setAvatar(e.target.files[0])} />
                </FormGroup>
                <FormGroup>
                    <label htmlFor="username">Nome de usuário</label>
                    <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
                </FormGroup>
                <FormGroup>
                    <label htmlFor="email">E-mail</label>
                    <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </FormGroup>
                <FormGroup>
                    <label htmlFor="bio">Bio</label>
                    <textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} />
                </FormGroup>
                <FormGroup>
                    <label htmlFor="password">Nova Senha (deixe em branco para não alterar)</label>
                    <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </FormGroup>
                <button type="submit">Salvar Alterações</button>
            </form>
        </EditProfileContainer>
    );
};

export default EditProfilePage;