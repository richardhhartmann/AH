import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import api, { API_URL } from '../api/axios';
import Modal from '../components/Modal';
import FullscreenStoryViewer from '../components/FullscreenStoryViewer';
import { BsChat } from "react-icons/bs";

// --- Styled Components (sem alterações) ---

const ProfileWrapper = styled.div`
  max-width: 935px;
  margin: 0 auto;
  padding: 30px 20px;
  @media (max-width: 768px) {
    padding: 15px;
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

  @media (max-width: 768px) {
    flex-direction: column;
    margin-bottom: 24px;
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
  border: ${props => props.hasStory ? '4px solid rgb(254, 121, 13)' : '3px solid #dbdbdb'};
  padding: 3px;

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
    margin-bottom: 10px;
    h2 { font-size: 22px; }
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
        background-color: #0095f6;
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
            fetchProfile();
        } catch (error) {
            console.error('Erro ao seguir/deixar de seguir', error);
        }
    };
    
    const handleStartChat = async () => {
        if (!profileData) return;
        try {
            const { data } = await api.post('/chats', { userId: profileData.user._id });
            navigate(`/chat/${data._id}`); 
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
    
    const openFollowersModal = async () => {
        if (!profileData || profileData.followerCount === 0) return;
        setModalTitle('Seguidores');
        setIsModalOpen(true);
        try {
            const { data } = await api.get(`/users/${profileData.user._id}/followers`);
            setModalUsers(data);
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
            setModalUsers(data);
        } catch (error) {
            console.error("Erro ao buscar usuários que segue", error);
        }
    };

    if (loading) return <p style={{textAlign: 'center', marginTop: '40px'}}>Carregando perfil...</p>;
    if (!profileData) return <p style={{textAlign: 'center', marginTop: '40px'}}>Usuário não encontrado.</p>;

    const { user, posts, postCount, followerCount, followingCount, isFollowing, hasActiveStory } = profileData;
    const isMyProfile = loggedInUser?._id === user._id;

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
        <ProfileWrapper>
            <ProfileHeader>
                <TopSection>
                    <AvatarContainer onClick={openStoryViewer}>
                        <Avatar 
                            src={
                                (user.avatar && user.avatar !== 'default_avatar_url') 
                                ? (user.avatar.startsWith('http') ? user.avatar : `${API_URL}${user.avatar}`)
                                : `${API_URL}/uploads/avatars/default.jpg`
                            }
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
                                        <ChatButton onClick={handleStartChat}>
                                            <BsChat size={16} />
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
                        {isMyProfile ? (
                            <ActionButtonMobile as={Link} to="/conta/editar">Editar Perfil</ActionButtonMobile>
                        ) : (
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
                        <PostThumbnail>
                            <img src={post.mediaUrl.startsWith('http') ? post.mediaUrl : `${API_URL}${post.mediaUrl}`} alt={post.caption} />
                        </PostThumbnail>
                    </Link>
                ))}
            </PostGrid>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalTitle}>
                {modalUsers.length > 0 ? (
                    modalUsers.map(user => (
                        <UserListItem key={user._id}>
                            <img 
                                src={
                                    user.avatar?.startsWith('http')
                                        ? user.avatar
                                        : `${API_URL}${user.avatar || '/uploads/avatars/default.jpg'}`
                                } 
                                alt={user.username} 
                            />
                            <Link to={`/perfil/${user.username}`} onClick={() => setIsModalOpen(false)}>
                                <strong>{user.username}</strong>
                            </Link>
                        </UserListItem>
                    ))
                ) : (
                    <p style={{ padding: '10px' }}>Nenhum usuário encontrado.</p>
                )}
            </Modal>
            
            {/* ================================================ */}
            {/* <<< AQUI ESTÁ A CORREÇÃO >>> */}
            {/* ================================================ */}
            {isViewerOpen && userActiveStories && (
                <FullscreenStoryViewer 
                    allUsersStories={userActiveStories} // Prop correta: allUsersStories
                    initialUserIndex={0}                 // Prop correta: o índice é 0, pois é o primeiro (e único) usuário no array
                    onClose={() => setIsViewerOpen(false)} 
                />
            )}
        </ProfileWrapper>
    );
};

export default ProfilePage;