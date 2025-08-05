// Caminho: src/pages/NewStoryPage.jsx

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';

const ENDPOINT = process.env.REACT_APP_API_URL;

// Estilos para o formulário
const FormContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
    background-color: #fff;
    border: 1px solid #dbdbdb;
    border-radius: 8px;
    max-width: 500px;
    margin: 20px auto;
`;

const StyledTextarea = styled.textarea`
    width: 100%;
    height: 100px;
    padding: 10px;
    margin-bottom: 15px;
    border: 1px solid #dbdbdb;
    border-radius: 4px;
    resize: vertical;
    font-family: inherit;
`;

const StyledInput = styled.input`
    width: 100%;
    margin-bottom: 15px;
`;

const StyledButton = styled.button`
    width: 100%;
    padding: 10px;
    background-color: #0095f6;
    color: white;
    border: none;
    border-radius: 4px;
    font-weight: bold;
    cursor: pointer;

    &:hover {
        background-color: #0077c6;
    }
`;

const ImagePreview = styled.img`
    max-width: 100%;
    margin-top: 15px;
    border-radius: 4px;
`;


const NewStoryPage = () => {
    const [caption, setCaption] = useState('');
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState('');

    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
        if (selectedFile) {
            setPreview(URL.createObjectURL(selectedFile));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 1. Verifica se o usuário está logado e se um arquivo foi selecionado
        if (!user) {
            alert('Você precisa estar logado para criar um post.');
            navigate('/login');
            return;
        }
        if (!file) {
            alert('Por favor, selecione uma imagem.');
            return;
        }

        // 2. Cria um objeto FormData para enviar arquivo + texto
        const formData = new FormData();
        formData.append('media', file);
        formData.append('caption', caption);

        try {
            // 3. Configura os headers da requisição com o token de autorização
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${user.token}`,
                }
            };

            // 4. Envia a requisição POST para a API do backend
            await axios.post(`${ENDPOINT}/api/stories`, formData, config);

            alert('Post criado com sucesso!');
            navigate('/'); // Redireciona para o feed após o sucesso

        } catch (error) {
            console.error('Erro ao criar o post', error.response?.data || error.message);
            alert('Falha ao criar o post. Verifique o console para mais detalhes.');
        }
    };

    return (
        <FormContainer>
            <h2>Criar Nova Publicação</h2>
            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                <StyledTextarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Escreva uma legenda..."
                />
                <StyledInput type="file" name="media" onChange={handleFileChange} required />
                <StyledButton type="submit">Publicar</StyledButton>
                {preview && <ImagePreview src={preview} alt="Pré-visualização" />}
            </form>
        </FormContainer>
    );
};

export default NewStoryPage;