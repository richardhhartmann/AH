import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api, { API_URL } from '../api/axios'; // Importe a API_URL
import { setCredentials } from '../features/auth/authSlice'; // Para atualizar o estado global

import Cropper from 'react-cropper';

import styled from 'styled-components';
import { FiCamera } from 'react-icons/fi';

// --- Styled Components ---

const PageContainer = styled.div`
    max-width: 700px;
    margin: 40px auto;
    padding: 0 20px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
`;

const FormWrapper = styled.form`
    background-color: #fff;
    border: 1px solid #dbdbdb;
    border-radius: 12px;
    padding: 30px;
`;

const Header = styled.h1`
    font-size: 2rem;
    font-weight: 600;
    text-align: center;
    margin-bottom: 30px;
    color: #262626;
`;

const Section = styled.section`
    margin-bottom: 30px;
`;

const SectionTitle = styled.h2`
    font-size: 1.1rem;
    font-weight: 600;
    color: #8e8e8e;
    border-bottom: 1px solid #efefef;
    padding-bottom: 10px;
    margin-bottom: 20px;
`;

// --- Componentes de Preview e Upload ---

const ProfilePreview = styled.div`
    position: relative;
    margin-bottom: 20px;
`;

const BannerPreview = styled.div`
    width: 100%;
    height: 180px;
    background-color: #efefef;
    border-radius: 8px;
    background-image: url(${props => props.src});
    background-size: cover;
    background-position: center;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #dbdbdb;
`;

const AvatarPreview = styled.img`
    width: 120px;
    height: 120px;
    border-radius: 50%;
    object-fit: cover;
    position: absolute;
    bottom: -60px;
    left: 50%;
    transform: translateX(-50%);
    border: 4px solid white;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    background-color: #fff;
`;

const ImageUploadWrapper = styled.div`
    position: relative;
    display: inline-block; /* Ajusta o tamanho ao conteúdo */
    
    // Posicionamento específico para o avatar e banner
    &.avatar-uploader {
        position: absolute;
        bottom: -50px;
        left: 50%;
        transform: translateX(30px); // Ajusta para ficar ao lado do círculo
    }

    &.banner-uploader {
        position: absolute;
        top: 10px;
        right: 10px;
    }
`;

const HiddenInput = styled.input`
    display: none;
`;

const UploadLabel = styled.label`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background-color: rgba(255, 255, 255, 0.9);
    color: #262626;
    border-radius: 50%;
    cursor: pointer;
    border: 1px solid #dbdbdb;
    transition: background-color 0.2s ease;
    
    &:hover {
        background-color: #f0f0f0;
    }
`;

// --- Componentes de Formulário ---

const FormField = styled.div`
    margin-bottom: 20px;
    position: relative;

    label {
        display: block;
        font-weight: 600;
        margin-bottom: 8px;
        font-size: 0.9rem;
        color: #262626;
    }

    input, textarea, select {
        width: 100%;
        padding: 12px;
        border: 1px solid #dbdbdb;
        border-radius: 6px;
        font-size: 1rem;
        background-color: #fafafa;
        transition: border-color 0.2s ease;

        &:focus {
            outline: none;
            border-color: #a8a8a8;
        }
    }

    textarea {
        resize: vertical;
        min-height: 100px;
    }
`;

const CharCounter = styled.span`
    position: absolute;
    bottom: 10px;
    right: 10px;
    font-size: 0.75rem;
    color: #8e8e8e;
`;

const ButtonContainer = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 30px;
`;

const Button = styled.button`
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    font-size: 0.9rem;
    cursor: pointer;
    transition: opacity 0.2s ease;

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const SubmitButton = styled(Button)`
    background-color: #fe790d;
    color: white;
`;

const CancelButton = styled(Button)`
    background-color: #efefef;
    color: #262626;
    border: 1px solid #dbdbdb;
`;

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
    max-width: 800px;
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


// --- Componente Principal ---

const EditProfilePage = () => {
    const { user: currentUser } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Estados do formulário
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [bio, setBio] = useState('');
    const [profession, setProfession] = useState('');
    const [password, setPassword] = useState('');
    const [avatarFile, setAvatarFile] = useState(null);
    const [bannerFile, setBannerFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [bannerPreview, setBannerPreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- NOVOS ESTADOS E REF PARA O RECORTE ---
    const [imageToCrop, setImageToCrop] = useState(null); // Armazena a imagem que o usuário selecionou
    const [isCropperOpen, setIsCropperOpen] = useState(false);
    const cropperRef = useRef(null);


    // useEffect para popular o formulário (sem alterações)
     useEffect(() => {
        if (currentUser) {
            const userData = currentUser.user || currentUser;

            setUsername(userData.username || '');
            setEmail(userData.email || '');
            setBio(userData.bio || '');
            setProfession(userData.profession || '');

            let finalAvatarUrl = userData.avatar && userData.avatar.includes('/')
                ? (userData.avatar.startsWith('http') ? userData.avatar : `${API_URL}${userData.avatar}`)
                : `${API_URL}/uploads/avatars/default.jpg`;
            setAvatarPreview(finalAvatarUrl);

            let finalBannerUrl = userData.banner && userData.banner.includes('/')
                ? (userData.banner.startsWith('http') ? userData.banner : `${API_URL}${userData.banner}`)
                : `${API_URL}/uploads/banners/default.png`;
            setBannerPreview(finalBannerUrl);
        }
    }, [currentUser]);

    useEffect(() => {
        // Esta é a função de "limpeza"
        return () => {
            if (imageToCrop) {
                URL.revokeObjectURL(imageToCrop);
            }
        };
    }, [imageToCrop]);


    // --- LÓGICA DE IMAGEM ATUALIZADA ---
    const handleImageChange = (e, type) => {
        e.preventDefault();
        const file = e.target.files[0];
        if (!file) return;

        if (type === 'avatar') {
            // Lógica para o avatar pode ser um recorte quadrado no futuro, por enquanto é direto
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        } else if (type === 'banner') {
            // Para o banner, abrimos o modal de recorte
            setImageToCrop(URL.createObjectURL(file));
            setIsCropperOpen(true);
        }
        // Limpa o valor do input para permitir selecionar o mesmo arquivo novamente
        e.target.value = null; 
    };

    const handleCrop = () => {
        if (typeof cropperRef.current?.cropper === "undefined") {
            return;
        }
        const cropper = cropperRef.current?.cropper;
        // Pega o canvas recortado
        const croppedCanvas = cropper.getCroppedCanvas();

        // Atualiza o preview na página principal
        setBannerPreview(croppedCanvas.toDataURL());

        // Converte o canvas em um arquivo (Blob) para ser enviado ao backend
        croppedCanvas.toBlob((blob) => {
            const croppedFile = new File([blob], "banner.jpg", { type: "image/jpeg" });
            setBannerFile(croppedFile); // Este é o arquivo que será enviado no submit
        }, "image/jpeg");

        setIsCropperOpen(false); // Fecha o modal
    };
    

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);

        const formData = new FormData();
        formData.append('username', username);
        formData.append('email', email);
        formData.append('bio', bio);
        formData.append('profession', profession);
        if (password) formData.append('password', password);
        if (avatarFile) formData.append('avatar', avatarFile);
        if (bannerFile) formData.append('banner', bannerFile); // Envia o arquivo recortado

        try {
            const { data } = await api.put('/users/profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            dispatch(setCredentials({ user: data }));
            alert('Perfil atualizado com sucesso!');
            navigate(`/perfil/${data.username}`);
        } catch (error) {
            console.error("Erro ao atualizar o perfil", error);
            alert(error.response?.data?.message || "Falha ao atualizar o perfil.");
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleCancel = () => {
        navigate(`/perfil/${currentUser.username}`);
    }

    return (
        <>
            <PageContainer>
                <Header>Editar Perfil</Header>
                <FormWrapper onSubmit={handleSubmit}>
                    {/* ... O resto do seu formulário permanece igual ... */}
                    <Section>
                        <SectionTitle>Visual</SectionTitle>
                        <ProfilePreview>
                            <BannerPreview src={bannerPreview}>
                                <ImageUploadWrapper className="banner-uploader">
                                    <UploadLabel htmlFor="banner-upload">
                                        <FiCamera />
                                    </UploadLabel>
                                    <HiddenInput id="banner-upload" type="file" accept="image/*" onChange={(e) => handleImageChange(e, 'banner')} />
                                </ImageUploadWrapper>
                            </BannerPreview>
                            <AvatarPreview src={avatarPreview} />
                            <ImageUploadWrapper className="avatar-uploader">
                                <UploadLabel htmlFor="avatar-upload">
                                    <FiCamera />
                                </UploadLabel>
                                <HiddenInput id="avatar-upload" type="file" accept="image/*" onChange={(e) => handleImageChange(e, 'avatar')} />
                            </ImageUploadWrapper>
                        </ProfilePreview>
                    </Section>
                    <div style={{ marginTop: '80px' }}></div>

                <Section>
                    <SectionTitle>Informações Públicas</SectionTitle>
                    <FormField>
                        <label htmlFor="username">Nome de usuário</label>
                        <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} maxLength="30" />
                        <CharCounter>{username.length} / 30</CharCounter>
                    </FormField>
                     <FormField>
                        <label htmlFor="profession">Profissão</label>
                        <select id="profession" value={profession} onChange={(e) => setProfession(e.target.value)}>
                            <option value="" disabled>Selecione sua profissão</option>
                            <option value="Especialista em Posicionamento">Especialista em Posicionamento</option>
                            <option value="Biomédico">Biomédico</option>
                            <option value="Programador">Programador</option>
                            <option value="Esteticista">Esteticista</option>
                            <option value="Dermatologista">Dermatologista</option>
                        </select>
                    </FormField>
                    <FormField>
                        <label htmlFor="bio">Bio</label>
                        <textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} maxLength="150" />
                        <CharCounter>{bio.length} / 150</CharCounter>
                    </FormField>
                </Section>
                
                <Section>
                    <SectionTitle>Dados da Conta</SectionTitle>
                     <FormField>
                        <label htmlFor="email">E-mail</label>
                        <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </FormField>
                    <FormField>
                        <label htmlFor="password">Nova Senha (deixe em branco para não alterar)</label>
                        <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    </FormField>
                </Section>

                <ButtonContainer>
                        <CancelButton type="button" onClick={handleCancel}>Cancelar</CancelButton>
                        <SubmitButton type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
                        </SubmitButton>
                    </ButtonContainer>
                </FormWrapper>
            </PageContainer>
            
            {isCropperOpen && (
                <ModalOverlay>
                    <ModalContent>
                        <ModalHeader>Ajustar Posição do Banner</ModalHeader>
                        <Cropper
                            ref={cropperRef}
                            src={imageToCrop}
                            style={{ height: 400, width: '100%' }}
                            // --- Configurações do Cropper ---
                            aspectRatio={16 / 5} // Proporção ideal para um banner
                            viewMode={1}         // Restringe a área de corte aos limites da imagem
                            guides={true}        // A "grade" que você pediu!
                            background={false}
                            responsive={true}
                            checkOrientation={false}
                        />
                        <ModalFooter>
                            <CancelButton onClick={() => setIsCropperOpen(false)}>Cancelar</CancelButton>
                            <SubmitButton onClick={handleCrop}>Confirmar e Cortar</SubmitButton>
                        </ModalFooter>
                    </ModalContent>
                </ModalOverlay>
            )}
        </>
    );
};

export default EditProfilePage;