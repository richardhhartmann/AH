import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom'; 
import { useSelector } from 'react-redux';
import axios from 'axios';
import styled from 'styled-components';
import Modal from '../components/Modal';

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
`;

const ProfileInfo = styled.section`
  flex-grow: 1;
`;

const UsernameRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  h2 {
    font-size: 28px;
    font-weight: 300;
    margin-right: 20px;
  }
`;

const ActionButton = styled.button`
    padding: 5px 9px;
    border: 1px solid #dbdbdb;
    border-radius: 4px;
    background-color: transparent;
    font-weight: bold;
    cursor: pointer;
    &.primary {
        background-color: #0095f6;
        color: white;
        border: none;
    }
`;

const StatsRow = styled.div`
  display: flex;
  margin-bottom: 20px;
  p {
    margin-right: 40px;
    font-size: 16px;
    cursor: pointer;
    &:hover { text-decoration: underline; }
    strong { font-weight: 600; }
  }
`;

const Bio = styled.div`
  p {
    font-weight: 600;
    margin-bottom: 5px;
  }
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
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalUsers, setModalUsers] = useState([]);

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            try {
                const config = { headers: { Authorization: `Bearer ${loggedInUser.token}` } };
                const { data } = await axios.get(`http://localhost:5000/api/users/profile/${username}`, config);
                setProfileData(data);
            } catch (error) {
                console.error("Erro ao buscar perfil", error);
            } finally {
                setLoading(false);
            }
        };
        if (loggedInUser) fetchProfile();
    }, [username, loggedInUser]);

    const handleFollow = async () => {
        if (!profileData) return;
        try {
            const config = { headers: { Authorization: `Bearer ${loggedInUser.token}` } };
            await axios.put(`http://localhost:5000/api/users/follow/${profileData.user._id}`, {}, config);
            setProfileData(prevData => ({
                ...prevData,
                isFollowing: !prevData.isFollowing,
                followerCount: !prevData.isFollowing ? prevData.followerCount + 1 : prevData.followerCount - 1
            }));
        } catch (error) {
            console.error('Erro ao seguir/deixar de seguir', error);
        }
    };

    const openFollowersModal = async () => {
        if (!profileData) return;
        setModalTitle('Seguidores');
        setIsModalOpen(true);
        try {
            const config = { headers: { Authorization: `Bearer ${loggedInUser.token}` } };
            const { data } = await axios.get(`http://localhost:5000/api/users/${profileData.user._id}/followers`, config);
            setModalUsers(data);
        } catch (error) {
            console.error("Erro ao buscar seguidores", error);
        }
    };

    const openFollowingModal = async () => {
        if (!profileData) return;
        setModalTitle('Seguindo');
        setIsModalOpen(true);
        try {
            const config = { headers: { Authorization: `Bearer ${loggedInUser.token}` } };
            const { data } = await axios.get(`http://localhost:5000/api/users/${profileData.user._id}/following`, config);
            setModalUsers(data);
        } catch (error) {
            console.error("Erro ao buscar usuários que segue", error);
        }
    };

    if (loading) return <p>Carregando perfil...</p>;
    if (!profileData) return <p>Usuário não encontrado.</p>;

    const { user, posts, postCount, followerCount, followingCount, isFollowing } = profileData;
    const isMyProfile = loggedInUser?._id === user._id;

    return (
        <ProfileWrapper>
            <ProfileHeader>
                <AvatarContainer>
                    <Avatar src={`http://localhost:5000${user.avatar}`} alt={`${user.username}'s avatar`} />
                </AvatarContainer>
                <ProfileInfo>
                    <UsernameRow>
                        <h2>{user.username}</h2>
                        {isMyProfile ? (
                            <ActionButton as={Link} to="/conta/editar">Editar Perfil</ActionButton>
                        ) : (
                            <ActionButton onClick={handleFollow} className={!isFollowing ? 'primary' : ''}>
                                {isFollowing ? 'Deixar de Seguir' : 'Seguir'}
                            </ActionButton>
                        )}
                    </UsernameRow>
                    <StatsRow>
                        <p><strong>{postCount}</strong> publicações</p>
                        <p onClick={openFollowersModal}><strong>{followerCount}</strong> seguidores</p>
                        <p onClick={openFollowingModal}><strong>{followingCount}</strong> seguindo</p>
                    </StatsRow>
                    <Bio>
                        <p>{user.username}</p>
                        <span>{user.bio}</span>
                    </Bio>
                </ProfileInfo>
            </ProfileHeader>

            <PostGrid>
                {posts.map(post => (
                    <Link key={post._id} to={`/post/${post._id}`}>
                        <PostThumbnail>
                            <img src={`http://localhost:5000${post.mediaUrl}`} alt={post.caption} />
                        </PostThumbnail>
                    </Link>
                ))}
            </PostGrid>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalTitle}>
                {modalUsers.length > 0 ? (
                    modalUsers.map(user => (
                        <UserListItem key={user._id}>
                            <img src={`http://localhost:5000${user.avatar}`} alt={user.username} />
                            <Link to={`/perfil/${user.username}`} onClick={() => setIsModalOpen(false)}>
                                <strong>{user.username}</strong>
                            </Link>
                        </UserListItem>
                    ))
                ) : (
                    <p>Nenhum usuário para exibir.</p>
                )}
            </Modal>
        </ProfileWrapper>
    );
};

export default ProfilePage;