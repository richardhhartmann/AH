import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../api/axios';
import styled from 'styled-components';
import Post from '../components/Post';
import StoriesBar from '../components/StoriesBar'; 
import StoryViewer from '../components/StoryViewer'; 
import Suggestions from '../components/Suggestions';

const ENDPOINT = process.env.REACT_APP_API_URL;

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

// --- Componente ---
const HomePage = () => {
  const { user: loggedInUser } = useSelector((state) => state.auth);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingUserStories, setViewingUserStories] = useState(null);


  useEffect(() => {
    const fetchFeed = async () => {
      if (!loggedInUser) return;

      setLoading(true);
      try {
        // CORREÇÃO:
        // Agora usamos a instância 'api', que já injeta o token.
        // Não precisamos mais do 'config' e nem da URL completa.
        const { data } = await api.get('/posts/feed');
        setPosts(data);
      } catch (error) {
        console.error('Falha ao buscar o feed', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, [loggedInUser]);

  if (!loggedInUser) {
    return (
        <WelcomeMessage>
            <h2>Bem-vindo à AceleraHOF!</h2>
            <p>Faça login para ver o feed ou cadastre-se para começar.</p>
        </WelcomeMessage>
    );
  }

  if (loading) {
    return <p>Carregando seu feed...</p>;
  }

  return (
        <HomeContainer>
            <FeedColumn>
                <StoriesBar onStoryClick={(userStories) => setViewingUserStories(userStories)} />
                
                {posts.length > 0 ? (
                    // Se houver posts, mostra o feed
                    posts.map((post) => <Post key={post._id} post={post} />)
                ) : (
                    // Se não houver posts, mostra as sugestões
                    <Suggestions />
                )}
            </FeedColumn>
    {viewingUserStories && (
    <StoryViewer 
                    userStories={viewingUserStories} 
                    onClose={() => setViewingUserStories(null)} 
                />
            )}
        </HomeContainer>
  );
};

export default HomePage;