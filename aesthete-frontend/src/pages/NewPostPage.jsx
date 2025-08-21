import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import api from '../api/axios';
import { IoArrowBack } from 'react-icons/io5';

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

const FooterActions = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
`;

const NewPostPage = () => {
    const [step, setStep] = useState(1);
    const [files, setFiles] = useState([]);
    const [caption, setCaption] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        if (files.length + selectedFiles.length > 10) {
            alert('Podes carregar no máximo 10 ficheiros.');
            return;
        }
        setFiles(prevFiles => [...prevFiles, ...selectedFiles]);
    };

    const handleRemoveFile = (index) => {
        setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    };

    const goToNextStep = () => {
        if (files.length > 0) {
            setStep(2);
        } else {
            alert('Por favor, selecione pelo menos um ficheiro de mídia.');
        }
    };

    const goToPreviousStep = () => {
        setStep(1);
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        const formData = new FormData();
        formData.append('caption', caption);
        files.forEach(file => {
            formData.append('media', file);
        });

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

    return (
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
                                            <img src={URL.createObjectURL(file)} alt={`preview ${index}`} />
                                        ) : (
                                            <video src={URL.createObjectURL(file)} muted />
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
                                        <img src={URL.createObjectURL(file)} alt={`preview ${index}`} />
                                    ) : (
                                        <video src={URL.createObjectURL(file)} muted controls={false} />
                                    )}
                                </PreviewItem>
                            ))}
                        </PreviewGrid>
                        <CaptionTextarea
                            placeholder="Escreve uma legenda..."
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                        />
                        <p>{caption.length} / 2,200</p>
                    </ContentWrapper>
                </>
            )}
        </PageWrapper>
    );
};

export default NewPostPage;