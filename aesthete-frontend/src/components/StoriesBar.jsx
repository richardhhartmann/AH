import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import api, { API_URL } from '../api/axios'; // Mantenha a importação da API_URL
import FullscreenStoryViewer from './FullscreenStoryViewer';

// --- Styled Components (sem alterações) ---
const StoriesContainer = styled.div`
  display: flex;
  gap: 15px;
  padding: 16px;
  background-color: #fff;
  border: 1px solid #dbdbdb;
  border-radius: 8px;
  margin-bottom: 24px;
  overflow-x: auto;
`;

const StoryCircle = styled.div`
  cursor: pointer;
  text-align: center;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 70px;

  img {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    /* A borda agora é controlada pela prop 'allViewed' */
    border: 3px solid ${props => props.allViewed ? '#dbdbdb' : 'rgb(254, 121, 13)'};
    padding: 2px;
    object-fit: cover;
  }
  p {
    font-size: 0.8rem;
    margin-top: 5px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
  }
`;

// --- Componente ---
const StoriesBar = () => {
    const { user: loggedInUser } = useSelector((state) => state.auth);
    const [storyFeed, setStoryFeed] = useState([]);
    const [viewedStories, setViewedStories] = useState(
        () => JSON.parse(localStorage.getItem('viewedStories')) || []
    );
    const [selectedUserStories, setSelectedUserStories] = useState(null);

    useEffect(() => {
        const fetchStories = async () => {
            if (!loggedInUser) return;
            try {
                const { data } = await api.get('/stories/feed');
                setStoryFeed(data);
            } catch (error) {
                console.error("Erro ao buscar stories", error);
            }
        };
        fetchStories();
    }, [loggedInUser]);

    const handleStoryClick = (userStories) => {
        setSelectedUserStories(userStories);
    };

    const handleCloseViewer = () => {
        setViewedStories(JSON.parse(localStorage.getItem('viewedStories')) || []);
        setSelectedUserStories(null);
    };
    
    // Função para construir a URL completa da imagem
    const getImageUrl = (url) => {
        if (!url) return '';
        return url.startsWith('http') ? url : `${API_URL}${url}`;
    };

    if (!storyFeed.length) {
        return null;
    }

    return (
        <>
            <StoriesContainer>
                {/* Mapeia TODOS os stories, incluindo os do usuário logado */}
                {storyFeed.map(userStories => {
                    const allStoriesViewed = userStories.stories.every(story => viewedStories.includes(story._id));
                    return (
                        <StoryCircle 
                            key={userStories.userId} 
                            onClick={() => handleStoryClick(userStories)}
                            allViewed={allStoriesViewed}
                        >
                            {/* CORREÇÃO AQUI: Usando a função getImageUrl para o avatar */}
                            <img src={getImageUrl(userStories.avatar)} alt={userStories.username} />
                            <p>{userStories.userId === loggedInUser._id ? 'Seu story' : userStories.username}</p>
                        </StoryCircle>
                    );
                })}
            </StoriesContainer>

            {selectedUserStories && (
                <FullscreenStoryViewer 
                    userStories={selectedUserStories} 
                    onClose={handleCloseViewer} 
                />
            )}
        </>
    );
};

export default StoriesBar;