// Caminho: src/pages/NewPostPage.jsx

import React, { useState, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled, { css } from 'styled-components';
import api from '../api/axios';
import PostCreationModal from '../components/PostCreationModal'; // Importe o novo componente de modal

// --- ESTILOS ---

// Estilo para a área de arrastar e soltar (Dropzone)
const DropzoneContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    max-width: 600px;
    height: 400px;
    border: 2px dashed #dbdbdb;
    border-radius: 12px;
    background-color: #fafafa;
    color: #8e8e8e;
    font-size: 1.2rem;
    text-align: center;
    cursor: pointer;
    margin: 40px auto;
    padding: 20px;
    transition: border-color 0.3s, background-color 0.3s;

    p {
        margin: 0;
    }

    /* Estilo ativado quando um arquivo é arrastado sobre a área */
    ${({ isDragActive }) =>
        isDragActive &&
        css`
            border-color: #0095f6;
            background-color: #f0f8ff;
        `}
`;

// Input de arquivo real, que ficará oculto
const HiddenInput = styled.input`
    display: none;
`;


// --- COMPONENTE ---

const NewPostPage = () => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState('');
    const [isDragActive, setIsDragActive] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const inputRef = useRef(null);

    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);

    // Função que processa o arquivo selecionado
    const handleFileSelect = useCallback((selectedFile) => {
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
            setIsModalOpen(true); // Abre o modal
        }
    }, []);

    // Funções para lidar com os eventos de arrastar
    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setIsDragActive(true);
        } else if (e.type === "dragleave") {
            setIsDragActive(false);
        }
    }, []);

    // Função para lidar com o evento de soltar o arquivo
    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    }, [handleFileSelect]);

    // Dispara o clique no input oculto
    const handleClick = () => {
        inputRef.current.click();
    };

    // Lida com a seleção de arquivo através do clique
    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0]);
        }
    };

    // Fecha o modal e reseta os estados
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setFile(null);
        setPreview('');
        if (inputRef.current) {
            inputRef.current.value = ""; // Permite selecionar o mesmo arquivo de novo
        }
    };

    // Função final de publicação, chamada pelo modal
    const handlePublish = async (caption) => {
        if (!user) {
            alert('Você precisa estar logado para criar um post.');
            navigate('/login');
            return;
        }
        if (!file) {
            alert('Nenhum arquivo selecionado.');
            return;
        }

        const formData = new FormData();
        formData.append('media', file);
        formData.append('caption', caption);

        try {
            await api.post('/posts', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            handleCloseModal();
            navigate('/');
        } catch (error) {
            console.error('Erro ao criar o post', error.response?.data || error.message);
            alert('Falha ao criar o post. Verifique o console para mais detalhes.');
        }
    };

    return (
        <>
            {/* ETAPA 1: Área de seleção de arquivo */}
            {!isModalOpen && (
                <DropzoneContainer
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={handleClick}
                    isDragActive={isDragActive}
                >
                    <HiddenInput
                        type="file"
                        ref={inputRef}
                        onChange={handleFileChange}
                        accept="image/*,video/*"
                    />
                    <p>Arraste uma foto ou vídeo aqui ou clique para selecionar</p>
                </DropzoneContainer>
            )}

            {/* ETAPAS 2 e 3: Modal de Edição e Publicação */}
            {isModalOpen && (
                <PostCreationModal
                    preview={preview}
                    fileType={file?.type}
                    onClose={handleCloseModal}
                    onPublish={handlePublish}
                />
            )}
        </>
    );
};

export default NewPostPage;