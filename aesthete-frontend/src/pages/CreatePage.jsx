import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import useMediaQuery from '../hooks/useMediaQuery';
import { IoImageOutline } from "react-icons/io5";
import { IoIosArrowBack } from "react-icons/io";
import { GoPencil } from "react-icons/go";
import api from '../api/axios'; // Importar a instância do axios

// --- Styled Components ---

const slideUp = keyframes`
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
`;

const ModalContent = styled.div`
  width: 100%;
  background-color: #fff;
  z-index: 1001;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  padding: 16px;
  animation: ${slideUp} 0.3s ease-out;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative; // Necessário para o botão de voltar
  text-align: center;
  font-weight: bold;
  font-size: 1.3rem;
  padding-bottom: 20px;
  border-bottom: 1px solid #dbdbdb;
`;

const ChoiceButton = styled(Link)`
  display: block;
  width: 100%;
  padding: 16px;
  font-size: 1rem;
  color: #262626;
  border: 1px solid #dbdbdb;
  border-radius: 8px;
  text-decoration: none;
  text-align: center;
  transition: background-color 0.2s ease-in-out;
  &:hover { background-color: #fafafa; }
`;

// --- Styled Components para o Modal de Postagem ---
const PostForm = styled.form`
  height: 80vh;
  width: 100%;
  background-color: #fff;
  z-index: 1001;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  padding: 16px;
  animation: ${slideUp} 0.3s ease-out;
  display: flex;
  flex-direction: column;
  gap: 12px; /* ALTERAÇÃO 1: Espaçamento geral diminuído */
`;

const MediaContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
  min-height: 200px;
`;

const BackButton = styled.button`
  background-color: rgb(254, 121, 13);
  color: white;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  font-size: 1.5rem;

  position: absolute;   /* fixar no header */
  left: 0;              /* grudar na esquerda */
  top: 50%;             /* centralizar verticalmente */
  transform: translateY(-75%);

  &:hover {
    opacity: 0.9;
  }
`;

const IconContainer = styled.div`
  color: rgb(254, 121, 13);
  margin-bottom: 10px; /* ALTERAÇÃO 1: Removida margem superior */
  text-align: center;

  svg {
    width: 80px;
    height: 80px;
  }
`;

const InfoText = styled.p`
  text-align: center;
  color: #8e8e8e;
  margin-bottom: 20px;
  max-width: 350px;   /* largura máxima do texto */
  margin-left: auto;  /* centraliza horizontalmente */
  margin-right: auto; /* idem */
  word-wrap: break-word; /* garante quebra em palavras longas */
`;

// NOVO: Preview da Imagem
const ImagePreview = styled.img`
  max-width: 100%;
  max-height: 300px;
  border-radius: 8px;
  object-fit: cover;
  margin-bottom: 16px;
`;

const GalleryButton = styled.button`
  padding: 12px 128px; /* ALTERAÇÃO 2: Padding horizontal para ajustar largura */
  background-color: rgb(254, 121, 13);
  color: white;
  border: none;
  border-radius: 32px;
  cursor: pointer;
  width: auto; /* ALTERAÇÃO 2: Largura automática */
  font-size: 1rem;
  font-weight: normal; /* ALTERAÇÃO 3: Peso da fonte normal */
`;

const DescriptionWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const StyledTextarea = styled.textarea`
  width: 100%;
  height: 100px;
  padding: 10px;
  padding-left: 34px; /* ALTERAÇÃO 4: Espaço à esquerda para o ícone */
  border: 1px solid #dbdbdb;
  border-radius: 8px;
  resize: none;
  font-family: inherit;
`;

const Icon = styled(GoPencil)`
  position: absolute;
  top: 12px;
  left: 10px;
  color: rgb(254, 121, 13); /* ALTERAÇÃO 4: Cor do ícone alterada */
  pointer-events: none;
`;

const CharCounter = styled.span`
  position: absolute;
  bottom: 10px;
  right: 10px;
  font-size: 0.8rem;
  color: #8e8e8e;
`;

const PublishButton = styled(GalleryButton)`
  margin-top: auto;
  width: 100%; /* Botão de publicar mantém largura total */
  padding: 12px; /* Padding original restaurado para este botão */

  &:disabled {
    background-color: rgb(255, 172, 104, 1);
    cursor: not-allowed;
  }
`;

const DesktopCreateContainer = styled.div`
    max-width: 600px;
    margin: 40px auto;
    text-align: center;
`;

const DesktopChoiceButton = styled(Link)`
    display: block;
    width: 100%;
    padding: 20px;
    margin: 20px 0;
    font-size: 1.2rem;
    color: rgb(254, 121, 13);
    border: 2px solid rgb(254, 121, 13);
    border-radius: 8px;
    text-decoration: none;
    transition: all 0.2s ease-in-out;

    &:hover {
        background-color: rgb(254, 121, 13);
        color: white;
    }
`;


const CreatePage = () => {
    const isMobile = useMediaQuery('(max-width: 768px)');
    const navigate = useNavigate();

    const [view, setView] = useState('selection');
    const [caption, setCaption] = useState('');
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const fileInputRef = useRef(null);

    const handleCreatePostClick = () => setView('post');
    const handleOpenGallery = () => fileInputRef.current.click();
    
    const handleFileChange = (e) => {
      const selectedFile = e.target.files[0];
      if (selectedFile) {
        setFile(selectedFile);
        setPreview(URL.createObjectURL(selectedFile));
      }
    };

    const handlePublish = async (e) => {
        e.preventDefault();
        if (!file || !caption.trim()) {
            alert('É necessário selecionar uma imagem e adicionar uma descrição.');
            return;
        }
        setIsLoading(true);

        const formData = new FormData();
        formData.append('media', file);
        formData.append('caption', caption);

        try {
            await api.post('/posts', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            navigate('/'); // Redireciona para o feed após sucesso
        } catch (error) {
            console.error('Erro ao criar o post', error.response?.data || error.message);
            alert('Falha ao criar o post.');
            setIsLoading(false);
        }
    };

    if (!isMobile) {
        return (
            <DesktopCreateContainer>
                <h2>O que você gostaria de criar?</h2>
                <DesktopChoiceButton to="/novo-post">Nova Publicação (Post)</DesktopChoiceButton>
                <DesktopChoiceButton to="/stories/novo">Novo Story</DesktopChoiceButton>
            </DesktopCreateContainer>
        );
    }

    return (
        <ModalOverlay onClick={() => navigate(-1)}>
            {view === 'selection' && (
                <ModalContent onClick={(e) => e.stopPropagation()}>
                    <ModalHeader>Criar</ModalHeader>
                    <ChoiceButton as="button" onClick={handleCreatePostClick}>Criar Post</ChoiceButton>
                    <ChoiceButton to="/stories/novo">Criar Story</ChoiceButton>
                </ModalContent>
            )}

            {view === 'post' && (
                <PostForm onSubmit={handlePublish} onClick={(e) => e.stopPropagation()}>
                    <ModalHeader>
                        <BackButton type="button" onClick={() => setView('selection')}>
                            <IoIosArrowBack />
                        </BackButton>
                        Postagem Feed
                    </ModalHeader>
                    
                    <MediaContainer>
                        {preview ? (
                            <ImagePreview src={preview} alt="Pré-visualização" />
                        ) : (
                            <>
                                <IconContainer>
                                    <IoImageOutline />
                                </IconContainer>
                                <InfoText>
                                    Clique no botão abaixo para acessar sua galeria e selecionar as fotos ou vídeos
                                </InfoText>
                            </>
                        )}
                        
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          style={{ display: 'none' }} 
                          onChange={handleFileChange}
                          accept="image/*,video/*"
                        />
                        <GalleryButton type="button" onClick={handleOpenGallery}>
                            {preview ? 'Escolher outro' : 'Abrir galeria'}
                        </GalleryButton>
                    </MediaContainer>
                    
                    <DescriptionWrapper>
                        <Icon />
                          <StyledTextarea
                            placeholder="Descrição da postagem..."
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                            maxLength={140}
                          />
                        <CharCounter>{caption.length}/140</CharCounter>
                    </DescriptionWrapper>
                    
                    <PublishButton type="submit" disabled={!file || !caption.trim() || isLoading}>
                        {isLoading ? 'Publicando...' : 'Criar Post'}
                    </PublishButton>
                </PostForm>
            )}
        </ModalOverlay>
    );
};

export default CreatePage;