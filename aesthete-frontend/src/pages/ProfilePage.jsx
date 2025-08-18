import React, { useState, useEffect, useCallback } from 'react';
import { FaHeart, FaComment } from 'react-icons/fa';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux'; 
import { fetchChats } from '../features/chat/chatSlice';
import styled from 'styled-components';
import api, { API_URL } from '../api/axios';
import Modal from '../components/Modal';
import FullscreenStoryViewer from '../components/FullscreenStoryViewer';
import { LikedIconPreview } from '../components/Icons';
import { GoGear } from "react-icons/go"; 
import { BsChat, BsChatFill } from "react-icons/bs";
import { IoAdd } from "react-icons/io5";
import { IoIosArrowBack } from "react-icons/io";

// --- Styled Components (sem alterações) ---

const ChatIconWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 16px;
  width: 16px;

  svg {
    position: absolute;
    transition: opacity 0.3s ease-in-out;
  }
`;

const MobileProfileHeader = styled.header`
  display: none; // Escondido por padrão, aparece apenas no mobile
  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: flex-start; // Alinha o botão à esquerda
    padding: 0 15px;
    height: 60px;
    background-color: transparent; // Fundo transparente
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 100;
  }
`;

const HeaderTitle = styled.h1`
  font-size: 1.1rem;
  font-weight: 600;
  text-align: center;
  flex-grow: 1; // FAZ O TÍTULO OCUPAR O ESPAÇO DISPONÍVEL
  color: white;
  text-shadow: 0px 1px 4px rgba(0, 0, 0, 0.8);
  // Remove o posicionamento absoluto para que ele participe do layout flex
`;

const BackButton = styled.button`
  background-color: rgb(254, 121, 13); // Fundo redondo laranja
  color: white; // Cor da seta
  border: none;
  border-radius: 50%; // Totalmente redondo
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  font-size: 1.5rem; // Tamanho do ícone da seta
  
  &:hover {
    opacity: 0.9;
  }
`;

const SettingsButton = styled(Link)`
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
  font-size: 1.2rem; // Tamanho do ícone de engrenagem
`;

const ProfileWrapper = styled.div`
  max-width: 935px;
  margin: 0 auto;
  padding: 0 20px 30px;

  @media (max-width: 768px) {
    padding: 60px 0 15px; // Adiciona espaço no topo
  }
`;

const BannerContainer = styled.div`
  width: 100%;
  height: 200px;
  background-color: #fff;
  background-image: url(${props => props.src});
  background-size: cover;
  background-position: center;
  margin-bottom: -80px; 

  @media (max-width: 768px) {
    height: 120px;
    margin-bottom: -50px;
    margin-top: -120px; /* <<< ESSA É A CORREÇÃO! */
  }
`;

const MobileChatButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: -15px;
    right: 5px;
    width: 48px;
    height: 48px;
    background-color: rgb(254, 121, 13);
    color: white;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    z-index: 10;
    transition: background-color 0.2s ease;

    &:hover {
        background-color: rgb(224, 101, 0);
    }
`;

const ProfileHeader = styled.header`
  display: flex;
  margin-bottom: 44px;
  position: relative; // Necessário para o z-index funcionar
  padding: 0 30px; // Adiciona um respiro nas laterais para não colar na borda

  @media (max-width: 768px) {
    flex-direction: column;
    margin-bottom: 24px;
    padding: 0 15px;
  }
`;

const FloatingCreateButton = styled(Link)`
  display: none; // Escondido por padrão
  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
    position: fixed;
    bottom: 80px; // Posição acima do footer de navegação
    right: 20px;
    width: 80px;
    height: 80px;
    background-color: rgb(254, 121, 13);
    color: white;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    z-index: 100;
    transition: transform 0.2s ease-in-out;

    &:hover {
      transform: scale(1.05);
    }

    svg {
      font-size: 2rem;
    }
  }
`;

const TopSection = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    margin-bottom: 0;
  }
`;

const AvatarContainer = styled.div`
  margin-right: 60px;
  flex-shrink: 0;

  @media (max-width: 768px) {
    margin-right: 30px;
  }
`;

const Avatar = styled.img`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  cursor: ${props => props.hasStory ? 'pointer' : 'default'};
  border: ${props => props.hasStory ? '4px solid rgb(254, 121, 13)' : '4px solid #fff'}; // Borda branca para destacar do banner
  padding: 3px;
  background-color: #fff; // Fundo branco para a borda ficar visível

  @media (max-width: 768px) {
    width: 80px;
    height: 80px;
  }
`;

const ProfileInfo = styled.section`
  flex-grow: 1;
`;
const UsernameRow = styled.div`
  display: flex;
  align-items: center;
  margin-top: 100px;
  margin-bottom: 20px;
  gap: 10px;
  flex-wrap: wrap;
  h2 {
    font-size: 28px;
    font-weight: 300;
    margin-right: 20px;
  }
    p {
    font-size: 22px;
    font-weight: 300;
    margin-right: 20px;
    }
  @media (max-width: 768px) {
    display: none;
  }
`;
const ActionButton = styled.button`
    padding: 7px 16px;
    border: 1px solid #dbdbdb;
    border-radius: 8px;
    background-color: #efefef;
    cursor: pointer;
    flex-shrink: 0;
    &.primary {
        background-color: #fe790d;
        color: white;
        border: none;
    }

    @media (max-width: 768px) {
        display: none;
    }
`;
const ActionButtonMobile = styled.button`
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  display: block;
  padding: 12px 24px;
  border: 1px solid #fe790d;
  border-radius: 999px;
  background-color: #fff4ec;
  color: #fe790d;
  font-size: 1rem;
  text-align: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s ease;

  &:hover {
    background-color: #ffe3cc;
  }

  &.primary {
    background-color: #fe790d;
    color: white;
    border: none;
  }
`;
const ChatButton = styled(ActionButton)`
    background-color: rgb(254, 121, 13);
    color: white;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;

    @media (max-width: 768px) {
        display: none;
    }
`;
const BioAndProfessionContainer = styled.div`
    position: relative;
    display: block;
    @media (max-width: 768px) {
        margin-top: 20px;
        padding: 0 5px;
    }
`;
const Bio = styled.div`
  .username {
    font-size: 1.4rem;
    font-weight: 600;
    margin-bottom: 5px;
  }

  span {
    font-size: 0.9rem;
    line-height: 1.5;
  }
`;
const Profession = styled.p`
  padding-top: 5px;
  padding-bottom: 3px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #f58529;
`;
const StatsRow = styled.div`
  display: flex;
  margin-bottom: 20px;

  p {
    margin-right: 40px;
    font-size: 16px;
    strong {
      font-weight: 600;
    }
  }

  @media (max-width: 768px) {
    justify-content: space-around;
    width: 100%;
    padding: 12px 0;
    margin-top: 24px;
    margin-bottom: 0;
    order: 1;

    p {
        margin: 0;
        text-align: center;
        display: flex;
        flex-direction: column;
        font-size: 0.9rem;
    }
  }

  p.clickable {
    cursor: pointer;
    &:hover { text-decoration: underline; }
  }
`;
const StatsRowMobile = styled.div`
  display: flex;
  margin-bottom: 20px;
  align-items: center;

  p {
    margin-right: 40px;
    display: flex;
    align-items: center;
    font-size: 14px;

    strong {
      color: rgb(254, 121, 13);
      margin-right: 4px;
      font-weight: 600;
    }
  }

  @media (max-width: 768px) {
    justify-content: flex-start;
    width: 100%;
    padding: 1px 0 0 0;
    margin-top: 3px;
    margin-bottom: 10px;
    order: 1;

    p {
        margin-right: 12px;
        display: flex;
        align-items: center;
        font-size: 14px;

        strong {
            color: rgb(254, 121, 13);
            margin-right: 4px;
            font-weight: 600;
        }

        .label {
            font-weight: normal;
        }
    }
  }

  p.clickable {
    cursor: pointer;
    &:hover {
      text-decoration: underline;
    }
  }
`;
const PostGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
  border-top: 1px solid #dbdbdb;
  padding-top: 15px;

  @media (min-width: 769px) {
      gap: 28px;
      padding-top: 30px;
  }
`;
const PostImage = styled.img`
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: cover;
  /* A propriedade 'transition' foi removida para efeito instantâneo */
`;

const PostStats = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  color: white;
  font-weight: bold;
  font-size: 1.1rem;
  
  span {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const PostOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  /* A propriedade 'transition' foi removida para efeito instantâneo */
`;

const PostThumbnailContainer = styled.div`
  position: relative;
  width: 100%;
  padding-bottom: 100%;
  cursor: pointer;

  &:hover ${PostOverlay} {
    opacity: 1;
  }

  &:hover ${PostImage} {
    filter: brightness(0.6);
  }
`;

const UserListItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
`;

const UserInfoModal = styled.div`
  display: flex;
  align-items: center;
  img {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    margin-right: 12px;
  }
  div {
    display: flex;
    flex-direction: column;
  }
  strong {
    font-size: 0.9rem;
    font-weight: 600;
  }
`;

const UserProfessionModal = styled.span`
  font-size: 0.8rem;
  color: #8e8e8e;
`;

const FollowButtonModal = styled.button`
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid transparent;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.8rem;
  
  &.follow {
    background-color: #fe790d;
    color: white;
  }
  &.unfollow {
    background-color: #efefef;
    color: black;
    border-color: #dbdbdb;
  }
`;


// --- Componente Principal ---
const ProfilePage = () => {
    const [isChatHovered, setIsChatHovered] = useState(false);
    const { username } = useParams();
    const { user: loggedInUser } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    // ... (resto dos seus estados)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalUsers, setModalUsers] = useState([]);
    const [userActiveStories, setUserActiveStories] = useState(null);
    const [isViewerOpen, setIsViewerOpen] = useState(false);

    const isMyProfile = loggedInUser?._id === profileData?.user?._id;

    const handleGoBack = () => {
        navigate(-1);
    };

    const fetchProfile = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/users/profile/${username}`);
            setProfileData(data);
        } catch (error) {
            console.error("Erro ao buscar perfil", error);
            navigate('/');
        } finally {
            setLoading(false);
        }
    }, [username, navigate]);

    useEffect(() => {
        if (loggedInUser) {
            fetchProfile();
        }
    }, [loggedInUser, fetchProfile]);

    const handleFollow = async () => {
        if (!profileData) return;
        try {
            await api.put(`/users/follow/${profileData.user._id}`);
            fetchProfile();
        } catch (error) {
            console.error('Erro ao seguir/deixar de seguir', error);
        }
    };
    
    const handleFollowInModal = async (targetUserId) => {
        try {
            await api.put(`/users/follow/${targetUserId}`);
            setModalUsers(currentUsers =>
                currentUsers.map(user => {
                    if (user._id === targetUserId) {
                        return { ...user, isFollowedByMe: !user.isFollowedByMe };
                    }
                    return user;
                })
            );
            fetchProfile();
        } catch (error) {
            console.error("Erro ao seguir/deixar de seguir no modal", error);
        }
    };

    const handleStartChat = async () => {
        if (!profileData) return;
        try {
            const { data } = await api.post('/chats', { userId: profileData.user._id });
            dispatch(fetchChats()); 
            navigate(`/chat/${data._id}`);
        } catch (error) {
            console.error("Erro ao iniciar chat", error);
        }
    };
    
    // ALTERAÇÃO 1: A função agora aceita um 'type' para saber qual modal está sendo aberto.
    const processModalUsers = (users, type) => {
        const usersWithFollowStatus = users.map(user => {
            let isFollowedByMe;

            // Se for o meu perfil e eu estiver vendo a lista de "Seguindo",
            // então, por definição, eu sigo todos nessa lista.
            if (isMyProfile && type === 'following') {
                isFollowedByMe = true;
            } else {
                // Para todos os outros casos, usa a lógica original.
                isFollowedByMe = loggedInUser?.following?.includes(user._id);
            }
            
            return {
                ...user,
                isFollowedByMe
            };
        });

        usersWithFollowStatus.sort((a, b) => {
            if (a._id === loggedInUser._id) return -1;
            if (b._id === loggedInUser._id) return 1;
            return 0;
        });

        setModalUsers(usersWithFollowStatus);
    };

    const openStoryViewer = async () => {
        if (!profileData?.hasActiveStory) return;
        try {
            const { data } = await api.get(`/stories/user/${profileData.user._id}`);
            setUserActiveStories(data);
            setIsViewerOpen(true);
        } catch (error) {
            console.error("Erro ao buscar stories do usuário", error);
        }
    };

    const openFollowersModal = async () => {
        if (!profileData || profileData.followerCount === 0) return;
        setModalTitle('Seguidores');
        setIsModalOpen(true);
        try {
            const { data } = await api.get(`/users/${profileData.user._id}/followers`);
            // ALTERAÇÃO 2: Passa o tipo 'followers' para a função de processamento.
            processModalUsers(data, 'followers');
        } catch (error) {
            console.error("Erro ao buscar seguidores", error);
        }
    };

    const openFollowingModal = async () => {
        if (!profileData || profileData.followingCount === 0) return;
        setModalTitle('Seguindo');
        setIsModalOpen(true);
        try {
            const { data } = await api.get(`/users/${profileData.user._id}/following`);
            // ALTERAÇÃO 3: Passa o tipo 'following' para a função de processamento.
            processModalUsers(data, 'following');
        } catch (error) {
            console.error("Erro ao buscar usuários que segue", error);
        }
    };


    if (loading) return <p style={{textAlign: 'center', marginTop: '40px'}}>Carregando perfil...</p>;
    if (!profileData) return <p style={{textAlign: 'center', marginTop: '40px'}}>Usuário não encontrado.</p>;

    const { user, posts, postCount, followerCount, followingCount, isFollowing, hasActiveStory } = profileData;
    
    const getImageUrl = (url) => {
        if (!url) return '';
        return url.startsWith('http') ? url : `${API_URL}${url}`;
    };

    const DesktopOnly = styled.div`
        display: block;
        @media (max-width: 768px) {
            display: none;
        }
    `;

    const MobileOnly = styled.div`
        display: none;
        @media (max-width: 768px) {
            display: block;
        }
    `;

    return (
        <>
            <MobileProfileHeader>
                <BackButton onClick={handleGoBack}>
                    <IoIosArrowBack  />
                </BackButton>
                <HeaderTitle></HeaderTitle>

                {isMyProfile ? (
                    <SettingsButton to="/conta/editar" title="Editar Perfil">
                        <GoGear />
                    </SettingsButton>
                ) : (
                    <div style={{ width: '32px' }} />
                )}
            </MobileProfileHeader>

            <ProfileWrapper>
                <BannerContainer src={getImageUrl(user.banner)} />
                <ProfileHeader>
                    <TopSection>
                    <AvatarContainer onClick={openStoryViewer}>
                        <Avatar
                            src={getImageUrl(user.avatar) || `${API_URL}/uploads/avatars/default.jpg`}
                            alt={`${user.username}'s avatar`}
                            hasStory={hasActiveStory}
                        />
                    </AvatarContainer>
                    <ProfileInfo>
                        <UsernameRow>
                            <p>{user.username}</p>
                             <DesktopOnly style={{ display: 'flex', gap: '10px' }}>
                                {isMyProfile ? (
                                    <ActionButton as={Link} to="/conta/editar">Editar Perfil</ActionButton>
                                ) : (
                                    <>
                                        <ActionButton onClick={handleFollow} className={!isFollowing ? 'primary' : ''}>
                                            {isFollowing ? 'Deixar de Seguir' : 'Seguir'}
                                        </ActionButton>
                                        <ChatButton
                                            onClick={handleStartChat}
                                            onMouseEnter={() => setIsChatHovered(true)}
                                            onMouseLeave={() => setIsChatHovered(false)}
                                        >
                                            {isChatHovered ? <BsChatFill size={16} /> : <BsChat size={16} />}
                                        </ChatButton>
                                    </>
                                )}
                            </DesktopOnly>
                        </UsernameRow>

                        <DesktopOnly>
                            <StatsRow>
                                <p><strong>{postCount}</strong> publicações</p>
                                <p className="clickable" onClick={openFollowersModal}>
                                    <strong>{followerCount}</strong> seguidores
                                </p>
                                <p className="clickable" onClick={openFollowingModal}>
                                    <strong>{followingCount}</strong> seguindo
                                </p>
                            </StatsRow>
                            <BioAndProfessionContainer>
                                <Bio>
                                    {user.profession && <Profession>{user.profession}</Profession>}
                                    <span>{user.bio}</span>
                                </Bio>
                            </BioAndProfessionContainer>
                        </DesktopOnly>
                    </ProfileInfo>
                </TopSection>

                <MobileOnly>
                    <BioAndProfessionContainer>
                        {!isMyProfile && (
                            <MobileChatButton onClick={handleStartChat}>
                                <BsChat size={24} />
                            </MobileChatButton>
                        )}
                        <Bio>
                            <p className="username">{user.username}</p>
                            {user.profession && <Profession>{user.profession}</Profession>}
                                <StatsRowMobile>
                                <p><strong>{postCount}</strong><span className="label">publicações</span></p>
                                <p className="clickable" onClick={openFollowersModal}>
                                    <strong>{followerCount}</strong><span className="label">seguidores</span>
                                </p>
                                <p className="clickable" onClick={openFollowingModal}>
                                    <strong>{followingCount}</strong><span className="label">seguindo</span>
                                </p>
                                </StatsRowMobile>
                            <span>{user.bio}</span>
                        </Bio>
                    </BioAndProfessionContainer>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', marginTop: '16px' }}>
                        {!isMyProfile && (
                            <ActionButtonMobile onClick={handleFollow} className={!isFollowing ? 'primary' : ''}>
                                {isFollowing ? 'Deixar de Seguir' : 'Seguir'}
                            </ActionButtonMobile>
                        )}
                    </div>
                </MobileOnly>
                </ProfileHeader>

                <PostGrid>
                    {posts.map(post => (
                        <Link key={post._id} to={`/post/${post._id}`}>
                            <PostThumbnailContainer>
                                <PostImage src={getImageUrl(post.mediaUrl)} alt={post.caption} />
                                <PostOverlay>
                                    <PostStats>
                                        <span>
                                            <LikedIconPreview /> {post.likes?.length || 0}
                                        </span>
                                        <span>
                                            <FaComment /> {post.comments?.length || 0}
                                        </span>
                                    </PostStats>
                                </PostOverlay>
                            </PostThumbnailContainer>
                        </Link>
                    ))}
                </PostGrid>

                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalTitle}>
                    {modalUsers.length > 0 ? (
                        modalUsers.map(user => (
                            <UserListItem key={user._id}>
                                <UserInfoModal>
                                    <img
                                        src={getImageUrl(user.avatar) || `${API_URL}/uploads/avatars/default.jpg`}
                                        alt={user.username}
                                    />
                                    <div>
                                        <Link to={`/perfil/${user.username}`} onClick={() => setIsModalOpen(false)}>
                                            <strong>{user.username}</strong>
                                        </Link>
                                        {/* ALTERAÇÃO 4: Adiciona a profissão abaixo do username. */}
                                        {user.profession && (
                                            <UserProfessionModal>{user.profession}</UserProfessionModal>
                                        )}
                                    </div>
                                </UserInfoModal>

                                {user._id !== loggedInUser._id && (
                                    <FollowButtonModal
                                        className={user.isFollowedByMe ? 'unfollow' : 'follow'}
                                        onClick={() => handleFollowInModal(user._id)}
                                    >
                                        {user.isFollowedByMe ? 'Deixar de Seguir' : 'Seguir'}
                                    </FollowButtonModal>
                                )}
                            </UserListItem>
                        ))
                    ) : (
                        <p style={{ padding: '10px' }}>Nenhum usuário encontrado.</p>
                    )}
                </Modal>

                {isViewerOpen && userActiveStories && (
                    <FullscreenStoryViewer
                        allUsersStories={userActiveStories}
                        initialUserIndex={0}
                        onClose={() => setIsViewerOpen(false)}
                    />
                )}
            </ProfileWrapper>
             {isMyProfile && (
                <FloatingCreateButton to="/criar" title="Criar nova publicação">
                    <IoAdd />
                </FloatingCreateButton>
            )}
        </>
    );
};

export default ProfilePage;