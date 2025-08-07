import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import api from '../api/axios';
import Post from '../components/Post';
import StoriesBar from '../components/StoriesBar';
import FullscreenStoryViewer from '../components/FullscreenStoryViewer';
import TopPosters from '../components/TopPosters';

// Componentes importados continuam iguais

const HomeContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 30px;
`;

const FeedColumn = styled.div`
  width: 100%;
  max-width: 615px;
`;

const FeedSelector = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  border-bottom: 1px solid #dbdbdb;
  margin-bottom: 24px;
  gap: 6px;
  width: 100%;
`;

const FeedTab = styled.button.attrs(() => ({ type: 'button' }))`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
  padding: 10px 0;
  color: ${props => (props.isActive ? '#262626' : '#8e8e8e')};
  position: relative;
  display: inline-block;
  min-width: 70px;
  text-align: center;
`;

const Underline = styled.div`
  position: absolute;
  bottom: 0;
  left: ${props => props.left}px;
  width: ${props => props.width}px;
  height: 4px; /* Barra mais grossa */
  background-color: rgb(254, 121, 13);
  border-radius: 2px;
  transition: left 0.3s ease, width 0.3s ease;
`;

const WelcomeMessage = styled.div`
  text-align: center;
  padding: 50px;
  background-color: #fff;
  border: 1px solid #dbdbdb;
  border-radius: 8px;
`;

// --- Componente principal ---
const HomePage = () => {
  const navigate = useNavigate();
  const { user: loggedInUser } = useSelector((state) => state.auth);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingUserStories, setViewingUserStories] = useState(null);
  const [feedType, setFeedType] = useState('following');

  // Refs para pegar posições dos botões para animar underline
  const followingRef = useRef(null);
  const exploreRef = useRef(null);

  // Estado para barra animada
  const [underlineProps, setUnderlineProps] = useState({ left: 0, width: 0 });

  useEffect(() => {
    if (!loggedInUser) {
      navigate('/login');
    }
  }, [loggedInUser, navigate]);

  const [feedsCache, setFeedsCache] = useState({ following: [], explore: [] });

  useEffect(() => {
    if (loggedInUser) {
      const fetchBothFeeds = async () => {
        try {
          const [followingRes, exploreRes] = await Promise.all([
            api.get('/posts/feed'),
            api.get('/posts/explore'),
          ]);
          setFeedsCache({
            following: followingRes.data,
            explore: exploreRes.data,
          });
          setPosts(feedType === 'following' ? followingRes.data : exploreRes.data);
        } catch (error) {
          console.error('Erro ao buscar feeds', error);
          setFeedsCache({ following: [], explore: [] });
          setPosts([]);
        } finally {
          setLoading(false);
        }
      };
      fetchBothFeeds();
    }
  }, [loggedInUser]);

  useEffect(() => {
    // Atualiza posts quando feedType muda usando cache
    setPosts(feedsCache[feedType] || []);
  }, [feedType, feedsCache]);

  useLayoutEffect(() => {
    const updateUnderline = () => {
      const ref = feedType === 'following' ? followingRef.current : exploreRef.current;
      if (ref) {
        const rect = ref.getBoundingClientRect();
        const parentRect = ref.parentElement.getBoundingClientRect();

        setUnderlineProps({
          left: rect.left - parentRect.left,
          width: rect.width,
        });
      }
    };

    updateUnderline();

    window.addEventListener('resize', updateUnderline);
    return () => window.removeEventListener('resize', updateUnderline);
  }, [feedType]);

  if (loading || !loggedInUser) {
    return <p style={{ textAlign: 'center', marginTop: '50px' }}>Carregando...</p>;
  }

  const handleClick = (e, newFeedType) => {
    e.preventDefault();
    setFeedType(newFeedType);
  };

  return (
    <HomeContainer>
      <FeedColumn>
        <TopPosters />
        <StoriesBar onStoryClick={(userStories) => setViewingUserStories(userStories)} />

        <FeedSelector>
          <FeedTab
            ref={followingRef}
            isActive={feedType === 'following'}
            onClick={(e) => handleClick(e, 'following')}
          >
            Seguindo
          </FeedTab>
          <FeedTab
            ref={exploreRef}
            isActive={feedType === 'explore'}
            onClick={(e) => handleClick(e, 'explore')}
          >
            Explorar
          </FeedTab>

          <Underline left={underlineProps.left} width={underlineProps.width} />
        </FeedSelector>

        {posts.length > 0 ? (
          posts.map((post) => <Post key={post._id} post={post} />)
        ) : (
          <WelcomeMessage>
            <h2>{feedType === 'following' ? 'Seu feed está vazio' : 'Nada para explorar'}</h2>
            <p>
              {feedType === 'following'
                ? 'Siga outros usuários para ver as publicações deles aqui.'
                : 'Ainda não há publicações na plataforma.'}
            </p>
          </WelcomeMessage>
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
