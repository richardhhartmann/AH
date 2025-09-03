import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import useMediaQuery from '../hooks/useMediaQuery';
import { IoImageOutline } from "react-icons/io5";
import { IoIosArrowBack } from "react-icons/io";
import { GoPencil } from "react-icons/go";
import api from '../api/axios';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';

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
  justify-content: center; /* Adicionado para centralizar o modal de recorte */
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
  overflow: hidden;
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

const PreviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 8px;
  width: 100%;
  max-height: 250px;
  overflow-y: auto;
  margin-bottom: 16px;
`;

const PreviewItem = styled.div`
  position: relative;
  width: 100%;
  padding-bottom: 100%;
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

// --- Styled Components para o Modal de Recorte (adicionados) ---
const CropperModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000; /* Z-index maior para sobrepor o modal de criação */
`;

const CropperModalContent = styled.div`
    background-color: #1a1a1a; /* Fundo escuro para o cropper */
    padding-top: 10px;
    border-radius: 12px;
    width: 95%;
    max-width: 500px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.3);
    display: flex;
    flex-direction: column;
    max-height: 90vh;
`;

const CropperModalHeader = styled.h3`
    font-size: 1.2rem;
    color: white;
    text-align: center;
    margin: 0;
    padding-bottom: 10px;
`;

const CropperModalFooter = styled.div`
    display: flex;
    justify-content: space-around; /* Botões espaçados */
    padding: 15px;
    border-top: 1px solid #333;
`;

const CropperModalButton = styled.button`
    padding: 10px 20px;
    border: none;
    border-radius: 8px;
    font-size: 0.9rem;
    font-weight: bold;
    cursor: pointer;
    background-color: #333;
    color: white;

    &.primary {
        background-color: rgb(254, 121, 13);
    }
`;

const CreatePage = () => {
    const isMobile = useMediaQuery('(max-width: 768px)');
    const navigate = useNavigate();
    const [view, setView] = useState('selection');
    const [caption, setCaption] = useState('');
    const [files, setFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    
    const fileInputRef = useRef(null);
    const [imageToCrop, setImageToCrop] = useState({ src: null, file: null });
    const [isCropperOpen, setIsCropperOpen] = useState(false);
    const cropperRef = useRef(null);

    const handleCreatePostClick = () => setView('post');
    const handleOpenGallery = () => fileInputRef.current.click();
    
    const handleFileChange = (e) => {
      const selectedFiles = Array.from(e.target.files);
      if (files.length + selectedFiles.length > 10) {
        alert('Podes selecionar no máximo 10 mídias.');
        return;
      }

      const imageFile = selectedFiles.find(f => f.type.startsWith('image/'));
      const otherFiles = selectedFiles.filter(f => !f.type.startsWith('image/'));

      if (imageFile) {
          setImageToCrop({ src: URL.createObjectURL(imageFile), file: imageFile });
          setIsCropperOpen(true);
      }
      
      setFiles(prevFiles => [...prevFiles, ...otherFiles]);
      e.target.value = null;
    };

    const handleCrop = () => {
        if (typeof cropperRef.current?.cropper === "undefined") return;
        
        const cropper = cropperRef.current?.cropper;
        cropper.getCroppedCanvas().toBlob((blob) => {
            const croppedFile = new File([blob], imageToCrop.file.name, { type: imageToCrop.file.type });
            const croppedUrl = URL.createObjectURL(croppedFile);
            
            setFiles(prevFiles => [croppedFile, ...prevFiles]);
            setPreviews(prev => [{ url: croppedUrl, type: croppedFile.type }, ...prev]);
            
            setIsCropperOpen(false);
            URL.revokeObjectURL(imageToCrop.src); // Limpa o URL do objeto original
            setImageToCrop({ src: null, file: null });
        }, imageToCrop.file.type);
    };

    const handleSkipCrop = () => {
        const originalFile = imageToCrop.file;
        setFiles(prevFiles => [originalFile, ...prevFiles]);
        setPreviews(prev => [{ url: imageToCrop.src, type: originalFile.type }, ...prev]);
        setIsCropperOpen(false);
        setImageToCrop({ src: null, file: null });
    };

    const handleRemoveMedia = (indexToRemove) => {
        setFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
        setPreviews(prevPreviews => {
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
    
    // Limpeza dos Object URLs
    useEffect(() => {
        return () => {
            previews.forEach(p => URL.revokeObjectURL(p.url));
            if (imageToCrop.src) {
                URL.revokeObjectURL(imageToCrop.src);
            }
        };
    }, [previews, imageToCrop.src]);


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
        <>
            <ModalOverlay onClick={() => view === 'selection' && navigate(-1)}>
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
                                        <PreviewItem key={preview.url}>
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
                              multiple
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

            {isCropperOpen && (
                <CropperModalOverlay>
                    <CropperModalContent>
                        <CropperModalHeader>Ajustar Imagem</CropperModalHeader>
                        <Cropper
                            ref={cropperRef}
                            src={imageToCrop.src}
                            style={{ height: 'calc(100% - 120px)', width: '100%' }}
                            aspectRatio={1}
                            viewMode={1}
                            guides={true}
                            background={false}
                            responsive={true}
                            checkOrientation={false}
                        />
                        <CropperModalFooter>
                            <CropperModalButton className="primary" onClick={handleCrop}>Recortar e Adicionar</CropperModalButton>
                        </CropperModalFooter>
                    </CropperModalContent>
                </CropperModalOverlay>
            )}
        </>
    );
};

export default CreatePage;