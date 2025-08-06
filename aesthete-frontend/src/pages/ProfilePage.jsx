import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import api, { API_URL } from '../api/axios';
import Modal from '../components/Modal';
import FullscreenStoryViewer from '../components/FullscreenStoryViewer';
import { IoChatbubbles } from "react-icons/io5";

// --- Styled Components ---

const ProfileWrapper = styled.div`
  max-width: 935px;
  margin: 0 auto;
  padding: 30px 20px;
`;

const ProfileHeader = styled.header`
  display: flex;
  margin-bottom: 44px;
`;

const AvatarContainer = styled.div`
  margin-right: 100px;
  flex-shrink: 0;
`;

const Avatar = styled.img`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  cursor: ${props => props.hasStory ? 'pointer' : 'default'};
  border: ${props => props.hasStory ? '4px solid rgb(254, 121, 13)' : '3px solid #dbdbdb'};
  padding: 3px;
`;

const ProfileInfo = styled.section`
  flex-grow: 1;
`;

const UsernameRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  gap: 10px;
  h2 {
    font-size: 28px;
    font-weight: 600;
    margin-right: 20px;
  }
`;

const ActionButton = styled.button`
    padding: 7px 16px;
    border: 1px solid #dbdbdb;
    border-radius: 8px;
    background-color: #efefef;
    font-weight: bold;
    cursor: pointer;
    &.primary {
        background-color: #0095f6;
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
`;

const StatsRow = styled.div`
  display: flex;
  margin-bottom: 20px;
  p {
    margin-right: 40px;
    font-size: 16px;
    cursor: pointer;
    &:hover { text-decoration: underline; }

    strong {
      font-weight: 600;
      color: rgb(254, 121, 13); /* Aqui está a mudança */
    }
  }
`;

const Bio = styled.div`
  p {
    font-weight: 600;
    margin-bottom: 5px;
  }
`;

const Profession = styled.p`
  font-size: 1rem;
  font-weight: 600;
  color: #f58529; /* Laranja */
  margin-top: -10px;
  margin-bottom: 20px;
`;

const PostGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 28px;
  border-top: 1px solid #dbdbdb;
  padding-top: 30px;
`;

const PostThumbnail = styled.div`
  position: relative;
  width: 100%;
  padding-bottom: 100%;
  img {
    position: absolute;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const UserListItem = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 12px;
    img {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        margin-right: 12px;
    }
`;

// --- Componente Principal ---
const ProfilePage = () => {
    const { username } = useParams();
    const { user: loggedInUser } = useSelector((state) => state.auth);
    const navigate = useNavigate();

    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalUsers, setModalUsers] = useState([]);
    const [userActiveStories, setUserActiveStories] = useState(null);
    const [isViewerOpen, setIsViewerOpen] = useState(false);

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
            // Recarrega os dados do perfil para garantir consistência
            fetchProfile();
        } catch (error) {
            console.error('Erro ao seguir/deixar de seguir', error);
        }
    };
    
    const handleStartChat = async () => {
        try {
            const { data } = await api.post('/chats', { userId: profileData.user._id });
            navigate('/chat', { state: { chatId: data._id } });
        } catch (error) {
            console.error("Erro ao iniciar chat", error);
        }
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
    
    // Funções para abrir os modais (seguidores/seguindo)
    const openFollowersModal = async () => { /* ... sua função ... */ };
    const openFollowingModal = async () => { /* ... sua função ... */ };

    if (loading) return <p>Carregando perfil...</p>;
    if (!profileData) return <p>Usuário não encontrado.</p>;

    const { user, posts, postCount, followerCount, followingCount, isFollowing, hasActiveStory } = profileData;
    const isMyProfile = loggedInUser?._id === user._id;

    return (
        <ProfileWrapper>
            <ProfileHeader>
                <AvatarContainer onClick={openStoryViewer}>
                    <Avatar 
                        src={user.avatar}
                        alt={`${user.username}'s avatar`}
                        hasStory={hasActiveStory}
                    />
                </AvatarContainer>
                <ProfileInfo>
                    <UsernameRow>
                        <h2>{user.username}</h2>
                        {isMyProfile ? (
                            <ActionButton as={Link} to="/conta/editar">Editar Perfil</ActionButton>
                        ) : (
                            <>
                                <ActionButton onClick={handleFollow} className={!isFollowing ? 'primary' : ''}>
                                    {isFollowing ? 'Deixar de Seguir' : 'Seguir'}
                                </ActionButton>
                                <ChatButton onClick={handleStartChat}>
                                    <IoChatbubbles size={16} />
                                </ChatButton>
                            </>
                        )}
                    </UsernameRow>
                    {user.profession && <Profession>{user.profession}</Profession>}
                    <StatsRow>
                        <p><strong>{postCount}</strong> publicações</p>
                        <p onClick={openFollowersModal}><strong>{followerCount}</strong> seguidores</p>
                        <p onClick={openFollowingModal}><strong>{followingCount}</strong> seguindo</p>
                    </StatsRow>
                    <Bio>
                        <span>{user.bio}</span>
                    </Bio>
                </ProfileInfo>
            </ProfileHeader>

            <PostGrid>
                {posts.map(post => (
                    <Link key={post._id} to={`/post/${post._id}`}>
                        <PostThumbnail>
                            <img src={post.mediaUrl} />
                        </PostThumbnail>
                    </Link>
                ))}
            </PostGrid>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalTitle}>
                 {/* ... conteúdo do modal ... */}
            </Modal>

            {isViewerOpen && userActiveStories && (
                <FullscreenStoryViewer 
                    userStories={userActiveStories} 
                    onClose={() => setIsViewerOpen(false)} 
                />
            )}
        </ProfileWrapper>
    );
};

export default ProfilePage;