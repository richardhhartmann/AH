import React, { useState, useRef, useEffect } from 'react'; // <-- CORREÇÃO: Adicionado 'useRef' e 'useEffect'
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import api from '../api/axios';
import { IoArrowBack } from 'react-icons/io5';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css'; // Garanta que a versão do cropperjs no package.json é a 1.5.13

// --- Styled Components ---

const PageWrapper = styled.div`
  max-width: 800px;
  margin: 40px auto;
  padding: 20px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #dbdbdb;
  padding-bottom: 10px;
  margin-bottom: 20px;

  h1 {
    font-size: 1.2rem;
  }
`;

const BackButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
`;

const NextButton = styled.button`
  background: none;
  border: none;
  color: #0095f6;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  &:disabled {
    color: #b2dffc;
    cursor: default;
  }
`;

const ShareButton = styled(NextButton)``;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FileInputContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2px dashed #dbdbdb;
  border-radius: 8px;
  padding: 20px;
  min-height: 300px;
  text-align: center;
  cursor: pointer;

  p {
    color: #8e8e8e;
  }
`;

const PreviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 10px;
  margin-top: 20px;
`;

const PreviewItem = styled.div`
  position: relative;
  width: 100px;
  height: 100px;

  img, video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 8px;
  }
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 5px;
  right: 5px;
  background: rgba(0,0,0,0.6);
  color: white;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  cursor: pointer;
  font-size: 0.8rem;
`;

const CaptionTextarea = styled.textarea`
  width: 100%;
  height: 150px;
  border: 1px solid #dbdbdb;
  border-radius: 8px;
  padding: 10px;
  resize: none;
  margin-bottom: 10px;
  &:focus {
    outline: none;
    border-color: #a8a8a8;
  }
`;

// --- CORREÇÃO: Componentes de Modal que estavam faltando ---
const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
`;

const ModalContent = styled.div`
    background-color: white;
    padding: 20px;
    border-radius: 12px;
    width: 90%;
    max-width: 500px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.3);
`;

const ModalHeader = styled.h3`
    font-size: 1.5rem;
    margin-top: 0;
    margin-bottom: 20px;
`;

const ModalFooter = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 20px;
`;

const ModalButton = styled.button`
    padding: 10px 20px;
    border: 1px solid #dbdbdb;
    border-radius: 8px;
    font-size: 0.9rem;
    cursor: pointer;
    background-color: #efefef;

    &.primary {
        background-color: #0095f6;
        color: white;
        border-color: #0095f6;
    }
`;
// --- FIM DA CORREÇÃO ---

const NewPostPage = () => {
    const [step, setStep] = useState(1);
    const [files, setFiles] = useState([]);
    const [caption, setCaption] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const [imageToCrop, setImageToCrop] = useState({ src: null, file: null });
    const [isCropperOpen, setIsCropperOpen] = useState(false);
    const cropperRef = useRef(null);

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        if (files.length + selectedFiles.length > 10) {
            alert('Podes carregar no máximo 10 ficheiros.');
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
        if (typeof cropperRef.current?.cropper === "undefined") {
            return;
        }
        const cropper = cropperRef.current?.cropper;
        cropper.getCroppedCanvas().toBlob((blob) => {
            const croppedFile = new File([blob], imageToCrop.file.name, { type: imageToCrop.file.type });
            setFiles(prevFiles => [croppedFile, ...prevFiles]);
            setIsCropperOpen(false);
            setImageToCrop({ src: null, file: null });
        }, imageToCrop.file.type);
    };

    const handleSkipCrop = () => {
        setFiles(prevFiles => [imageToCrop.file, ...prevFiles]);
        setIsCropperOpen(false);
        setImageToCrop({ src: null, file: null });
    };

    const handleRemoveFile = (index) => {
        const fileToRemove = files[index];
        if (fileToRemove.previewUrl) {
            URL.revokeObjectURL(fileToRemove.previewUrl);
        }
        setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    };

    const goToNextStep = () => {
        if (files.length > 0) setStep(2);
        else alert('Por favor, selecione pelo menos um ficheiro de mídia.');
    };

    const goToPreviousStep = () => setStep(1);

    const handleSubmit = async () => {
        setIsLoading(true);
        const formData = new FormData();
        formData.append('caption', caption);
        files.forEach(file => formData.append('media', file));

        try {
            await api.post('/posts', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            navigate('/');
        } catch (error) {
            console.error("Erro ao criar post", error);
            alert("Ocorreu um erro ao criar a publicação.");
        } finally {
            setIsLoading(false);
        }
    };

    const filePreviews = files.map(file => {
        if (file.previewUrl) return file.previewUrl;
        const url = URL.createObjectURL(file);
        // eslint-disable-next-line no-param-reassign
        file.previewUrl = url;
        return url;
    });

    useEffect(() => {
        return () => {
            filePreviews.forEach(url => URL.revokeObjectURL(url));
            if (imageToCrop.src) {
                URL.revokeObjectURL(imageToCrop.src);
            }
        };
    }, [filePreviews, imageToCrop.src]);

    return (
        <>
            <PageWrapper>
                {step === 1 && (
                    <>
                        <Header>
                            <BackButton onClick={() => navigate(-1)}><IoArrowBack /></BackButton>
                            <h1>Nova publicação</h1>
                            <NextButton onClick={goToNextStep} disabled={files.length === 0}>Próximo</NextButton>
                        </Header>
                        <ContentWrapper>
                            <input
                                type="file"
                                id="file-upload"
                                multiple
                                accept="image/*,video/*"
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                            />
                            <FileInputContainer onClick={() => document.getElementById('file-upload').click()}>
                                <p>Arrasta fotos e vídeos para aqui</p>
                            </FileInputContainer>
                            {files.length > 0 && (
                                <PreviewGrid>
                                    {files.map((file, index) => (
                                        <PreviewItem key={index}>
                                            {file.type.startsWith('image/') ? (
                                                <img src={file.previewUrl} alt={`preview ${index}`} />
                                            ) : (
                                                <video src={file.previewUrl} muted />
                                            )}
                                            <RemoveButton onClick={() => handleRemoveFile(index)}>X</RemoveButton>
                                        </PreviewItem>
                                    ))}
                                </PreviewGrid>
                            )}
                        </ContentWrapper>
                    </>
                )}

                {step === 2 && (
                    <>
                        <Header>
                            <BackButton onClick={goToPreviousStep}><IoArrowBack /></BackButton>
                            <h1>Nova publicação</h1>
                            <ShareButton onClick={handleSubmit} disabled={isLoading}>
                                {isLoading ? 'Publicando...' : 'Publicar'}
                            </ShareButton>
                        </Header>
                        <ContentWrapper>
                            <PreviewGrid style={{ marginBottom: '20px' }}>
                                {files.map((file, index) => (
                                    <PreviewItem key={index}>
                                        {file.type.startsWith('image/') ? (
                                            <img src={file.previewUrl} alt={`preview ${index}`} />
                                        ) : (
                                            <video src={file.previewUrl} muted controls={false} />
                                        )}
                                    </PreviewItem>
                                ))}
                            </PreviewGrid>
                            <CaptionTextarea
                                placeholder="Escreve uma legenda..."
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                            />
                        </ContentWrapper>
                    </>
                )}
            </PageWrapper>
            
            {isCropperOpen && (
                <ModalOverlay>
                    <ModalContent>
                        <ModalHeader>Recortar Imagem</ModalHeader>
                        <Cropper
                            ref={cropperRef}
                            src={imageToCrop.src}
                            style={{ height: 400, width: '100%' }}
                            aspectRatio={1}
                            viewMode={1}
                            guides={true}
                            background={false}
                            responsive={true}
                            checkOrientation={false}
                        />
                        <ModalFooter>
                            <ModalButton className="primary" onClick={handleCrop}>Recortar e Adicionar</ModalButton>
                        </ModalFooter>
                    </ModalContent>
                </ModalOverlay>
            )}
        </>
    );
};

export default NewPostPage;