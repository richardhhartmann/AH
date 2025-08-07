import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import api from '../api/axios';

// Componentes
import Post from '../components/Post';
import StoriesBar from '../components/StoriesBar';
import FullscreenStoryViewer from '../components/FullscreenStoryViewer';
import TopPosters from '../components/TopPosters'; // Importa o novo componente de ranking

// --- Styled Components ---
const HomeContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 30px;
`;

const FeedColumn = styled.div`
  width: 100%;
  max-width: 615px;
`;

const WelcomeMessage = styled.div`
  text-align: center;
  padding: 50px;
  background-color: #fff;
  border: 1px solid #dbdbdb;
  border-radius: 8px;
`;

const FeedSelector = styled.div`
  display: flex;
  gap: 16px; /* ou menos, tipo 8px */
  border-bottom: 1px solid #dbdbdb;
  margin-bottom: 24px;
  justify-content: center;
`;

const TabText = styled.span`
  border-bottom: ${props => props.isActive ? '3px solid rgb(254, 121, 13)' : '2px solid transparent'};
  border-radius: 1px;
  padding-bottom: 4px;
  transition: border-bottom 0.2s ease-in-out;
`;

const FeedTab = styled.button`
  padding: 10px 16px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  color: ${props => props.isActive ? '#262626' : '#8e8e8e'};
  transition: all 0.2s ease-in-out;
  display: flex;
  justify-content: center;
`;


// --- Componente ---
const HomePage = () => {
  const { user: loggedInUser } = useSelector((state) => state.auth);
  
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingUserStories, setViewingUserStories] = useState(null);
  const [feedType, setFeedType] = useState('following'); // 'following' ou 'explore'

  useEffect(() => {
    const fetchFeed = async () => {
      if (!loggedInUser) return;

      setLoading(true);
      try {
        // Define qual API chamar com base no estado 'feedType'
        const endpoint = feedType === 'following' ? '/posts/feed' : '/posts/explore';
        const { data } = await api.get(endpoint);
        setPosts(data);
      } catch (error) {
        console.error(`Falha ao buscar o feed ${feedType}`, error);
        setPosts([]); // Limpa os posts em caso de erro
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, [loggedInUser, feedType]); // Roda o efeito sempre que o feedType mudar

  if (!loggedInUser) {
    return (
        <WelcomeMessage>
            <h2>Bem-vindo à Aesthete!</h2>
            <p>Faça login para ver o feed ou cadastre-se para começar.</p>
        </WelcomeMessage>
    );
  }

  return (
        <HomeContainer>
            <FeedColumn>
                <TopPosters />
                <StoriesBar onStoryClick={(userStories) => setViewingUserStories(userStories)} />
                
                
                
                <FeedSelector>
                  <FeedTab isActive={feedType === 'following'} onClick={() => setFeedType('following')}>
                    <TabText isActive={feedType === 'following'}>Seguindo</TabText>
                  </FeedTab>
                  <FeedTab isActive={feedType === 'explore'} onClick={() => setFeedType('explore')}>
                    <TabText isActive={feedType === 'explore'}>Explorar</TabText>
                  </FeedTab>
                </FeedSelector>
                
                {loading ? (
                    <p style={{ textAlign: 'center', marginTop: '40px' }}>Carregando...</p>
                ) : (
                    posts.length > 0 ? (
                        posts.map((post) => <Post key={post._id} post={post} />)
                    ) : (
                        <WelcomeMessage>
                            <h2>
                                {feedType === 'following' 
                                    ? 'Seu feed está vazio' 
                                    : 'Nada para explorar'}
                            </h2>
                            <p>
                                {feedType === 'following' 
                                    ? 'Siga outros usuários para ver as publicações deles aqui.' 
                                    : 'Ainda não há publicações na plataforma.'}
                            </p>
                        </WelcomeMessage>
                    )
                )}
            </FeedColumn>
            
            {viewingUserStories && (
                <FullscreenStoryViewer 
                    userStories={viewingUserStories} 
                    onClose={() => setViewingUserStories(null)} 
                />
            )}
        </HomeContainer>
  );
};

export default HomePage;