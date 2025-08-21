import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import useMediaQuery from '../hooks/useMediaQuery';
import { IoImageOutline } from "react-icons/io5";
import { IoIosArrowBack } from "react-icons/io";
import { GoPencil } from "react-icons/go";
import api from '../api/axios';

// --- Styled Components (O TEU CÓDIGO ORIGINAL - SEM ALTERAÇÕES) ---

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
  position: relative;
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
  gap: 12px;
`;

const MediaContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
  min-height: 200px;
  overflow: hidden; // Adicionado para conter os previews
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
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-75%);
  &:hover {
    opacity: 0.9;
  }
`;

const IconContainer = styled.div`
  color: rgb(254, 121, 13);
  margin-bottom: 10px;
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
  max-width: 350px;
  margin-left: auto;
  margin-right: auto;
  word-wrap: break-word;
`;

// --- INÍCIO DAS MODIFICAÇÕES DE ESTILO PARA MÚLTIPLAS MÍDIAS ---
const PreviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 8px;
  width: 100%;
  max-height: 250px; // Altura máxima para a grelha
  overflow-y: auto; // Scroll se houver muitas mídias
  margin-bottom: 16px;
`;

const PreviewItem = styled.div`
  position: relative;
  width: 100%;
  padding-bottom: 100%; /* Força o aspect ratio 1:1 */

  img, video {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 8px;
  }
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(0,0,0,0.7);
  color: white;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  cursor: pointer;
  font-size: 0.7rem;
  line-height: 20px;
  text-align: center;
  padding: 0;
  z-index: 2;
`;
// --- FIM DAS MODIFICAÇÕES DE ESTILO ---


const GalleryButton = styled.button`
  padding: 12px 128px;
  background-color: rgb(254, 121, 13);
  color: white;
  border: none;
  border-radius: 32px;
  cursor: pointer;
  width: auto;
  font-size: 1rem;
  font-weight: normal;
`;

const DescriptionWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const StyledTextarea = styled.textarea`
  width: 100%;
  height: 100px;
  padding: 10px;
  padding-left: 34px;
  border: 1px solid #dbdbdb;
  border-radius: 8px;
  resize: none;
  font-family: inherit;
`;

const Icon = styled(GoPencil)`
  position: absolute;
  top: 12px;
  left: 10px;
  color: rgb(254, 121, 13);
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
  width: 100%;
  padding: 12px;

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

    // --- INÍCIO DAS ALTERAÇÕES LÓGICAS ---
    const [view, setView] = useState('selection');
    const [caption, setCaption] = useState('');
    const [files, setFiles] = useState([]); // Alterado para array
    const [previews, setPreviews] = useState([]); // Alterado para array
    const [isLoading, setIsLoading] = useState(false);
    
    const fileInputRef = useRef(null);

    const handleCreatePostClick = () => setView('post');
    const handleOpenGallery = () => fileInputRef.current.click();
    
    const handleFileChange = (e) => {
      const selectedFiles = Array.from(e.target.files);
      
      if (files.length + selectedFiles.length > 10) {
        alert('Podes selecionar no máximo 10 mídias.');
        return;
      }

      setFiles(prevFiles => [...prevFiles, ...selectedFiles]);

      const newPreviews = selectedFiles.map(file => ({
        url: URL.createObjectURL(file),
        type: file.type
      }));
      setPreviews(prevPreviews => [...prevPreviews, ...newPreviews]);
    };

    const handleRemoveMedia = (indexToRemove) => {
        setFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
        setPreviews(prevPreviews => {
            // Revoga o URL do objeto para libertar memória
            URL.revokeObjectURL(prevPreviews[indexToRemove].url);
            return prevPreviews.filter((_, index) => index !== indexToRemove);
        });
    };

    const handlePublish = async (e) => {
        e.preventDefault();
        if (files.length === 0 || !caption.trim()) {
            alert('É necessário selecionar pelo menos uma mídia e adicionar uma descrição.');
            return;
        }
        setIsLoading(true);

        const formData = new FormData();
        formData.append('caption', caption);
        files.forEach(file => {
            formData.append('media', file);
        });

        try {
            await api.post('/posts', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            navigate('/');
        } catch (error) {
            console.error('Erro ao criar o post', error.response?.data || error.message);
            alert('Falha ao criar o post.');
        } finally {
            setIsLoading(false);
        }
    };
    // --- FIM DAS ALTERAÇÕES LÓGICAS ---

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
                        {previews.length > 0 ? (
                            <PreviewGrid>
                                {previews.map((preview, index) => (
                                    <PreviewItem key={index}>
                                        <RemoveButton type="button" onClick={() => handleRemoveMedia(index)}>x</RemoveButton>
                                        {preview.type.startsWith('image/') ? (
                                            <img src={preview.url} alt={`Pré-visualização ${index + 1}`} />
                                        ) : (
                                            <video src={preview.url} muted />
                                        )}
                                    </PreviewItem>
                                ))}
                            </PreviewGrid>
                        ) : (
                            <>
                                <IconContainer><IoImageOutline /></IconContainer>
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
                          multiple // Permite múltiplos ficheiros
                        />
                        <GalleryButton type="button" onClick={handleOpenGallery}>
                            {previews.length > 0 ? 'Adicionar mais' : 'Abrir galeria'}
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
                    
                    <PublishButton type="submit" disabled={files.length === 0 || !caption.trim() || isLoading}>
                        {isLoading ? 'Publicando...' : 'Criar Post'}
                    </PublishButton>
                </PostForm>
            )}
        </ModalOverlay>
    );
};

export default CreatePage;