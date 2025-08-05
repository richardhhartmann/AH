import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import styled from 'styled-components';
import Post from '../components/Post';
import StoriesBar from '../components/StoriesBar'; 
import StoryViewer from '../components/StoryViewer'; 

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
        const config = {
          headers: { Authorization: `Bearer ${loggedInUser.token}` },
        };
        const { data } = await axios.get(`${ENDPOINT}/api/posts/feed`, config);
        setPosts(data);
      } catch (error) {
        console.error('Falha ao buscar o feed', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, [loggedInUser]); // Roda o efeito sempre que o usuário logado mudar

  if (!loggedInUser) {
    return (
        <WelcomeMessage>
            <h2>Bem-vindo à Aesthete!</h2>
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
            posts.map((post) => <Post key={post._id} post={post} />)
            ) : (
            <WelcomeMessage>
                <h2>Seu feed está vazio</h2>
                <p>Siga outros usuários para ver as publicações deles aqui.</p>
            </WelcomeMessage>
            )}
      </FeedColumn>
      {/* A SidebarColumn pode ser adicionada aqui no futuro */}
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