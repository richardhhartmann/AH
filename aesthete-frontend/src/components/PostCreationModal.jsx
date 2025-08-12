// Caminho: src/components/PostCreationModal.jsx

import React, { useState } from 'react';
import styled from 'styled-components';

// --- ESTILOS ---

// Fundo escurecido que cobre a tela inteira
const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.75);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
`;

// Conteúdo do modal
const ModalContent = styled.div`
    background-color: #fff;
    border-radius: 12px;
    max-width: 90vw;
    max-height: 90vh;
    display: flex;
    overflow: hidden;
    flex-direction: column;

    /* Layout lado a lado para telas maiores */
    @media (min-width: 768px) {
        flex-direction: row;
        max-width: 900px;
    }
`;

// Container da mídia (imagem ou vídeo)
const MediaContainer = styled.div`
    flex: 1.5;
    background-color: #000;
    display: flex;
    align-items: center;
    justify-content: center;
    
    img, video {
        max-width: 100%;
        max-height: 90vh;
        display: block;
    }
`;

// Container do formulário (legenda e botão)
const FormContainer = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 20px;
    min-width: 300px;
`;

// Cabeçalho do formulário
const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 15px;
    border-bottom: 1px solid #dbdbdb;
    margin-bottom: 15px;

    h2 {
        margin: 0;
        font-size: 1.1rem;
        font-weight: 600;
    }
`;

const StyledTextarea = styled.textarea`
    width: 100%;
    border: none;
    resize: none;
    font-family: inherit;
    font-size: 1rem;
    outline: none;
    flex-grow: 1; /* Ocupa o espaço vertical disponível */
`;

const StyledButton = styled.button`
    padding: 10px 12px;
    background-color: #0095f6;
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: bold;
    cursor: pointer;
    margin-top: auto; /* Empurra o botão para baixo */

    &:hover:not(:disabled) {
        background-color: #0077c6;
    }

    &:disabled {
        background-color: #b2dffc;
        cursor: not-allowed;
    }
`;

const CloseButton = styled.button`
    position: absolute;
    top: 15px;
    right: 15px;
    background: transparent;
    border: none;
    font-size: 2.5rem;
    color: #fff;
    cursor: pointer;
    line-height: 1;
    z-index: 1001;
`;

// --- COMPONENTE ---

const PostCreationModal = ({ preview, fileType, onClose, onPublish }) => {
    const [caption, setCaption] = useState('');
    const [isPublishing, setIsPublishing] = useState(false);

    // Chama a função de publicação e gerencia o estado de "publicando"
    const handlePublishClick = async () => {
        setIsPublishing(true);
        await onPublish(caption);
        setIsPublishing(false);
    };

    const isVideo = fileType && fileType.startsWith('video');

    return (
        <ModalOverlay>
            <CloseButton onClick={onClose}>&times;</CloseButton>
            <ModalContent>
                <MediaContainer>
                    {isVideo ? (
                        <video src={preview} controls autoPlay loop />
                    ) : (
                        <img src={preview} alt="Pré-visualização da postagem" />
                    )}
                </MediaContainer>
                <FormContainer>
                    <Header>
                        <h2>Adicionar Legenda</h2>
                    </Header>
                    <StyledTextarea
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        placeholder="Escreva uma legenda..."
                    />
                    <StyledButton onClick={handlePublishClick} disabled={isPublishing}>
                        {isPublishing ? 'Publicando...' : 'Publicar'}
                    </StyledButton>
                </FormContainer>
            </ModalContent>
        </ModalOverlay>
    );
};

export default PostCreationModal;