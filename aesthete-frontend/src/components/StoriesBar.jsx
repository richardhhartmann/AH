import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import api, { API_URL } from '../api/axios';
import FullscreenStoryViewer from './FullscreenStoryViewer';

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
  img {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    border: 3px solid ${props => props.allViewed ? '#dbdbdb' : 'rgb(254, 121, 13)'};
    padding: 2px;
  }
  p {
    font-size: 0.8rem;
    margin-top: 5px;
  }
`;

const StoriesBar = () => {
    const { user: loggedInUser } = useSelector((state) => state.auth);
    const [storyFeed, setStoryFeed] = useState([]);
    const [viewedStories, setViewedStories] = useState(
        JSON.parse(localStorage.getItem('viewedStories')) || []
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
        // Atualiza o estado de 'visto' na barra ao fechar o visualizador
        setViewedStories(JSON.parse(localStorage.getItem('viewedStories')) || []);
        setSelectedUserStories(null);
    };

    const myStories = storyFeed.find(userStories => userStories.userId === loggedInUser._id);
    const otherStories = storyFeed.filter(userStories => userStories.userId !== loggedInUser._id);

    return (
        <>
            <StoriesContainer>
                {myStories && (
                    <StoryCircle 
                        onClick={() => handleStoryClick(myStories)}
                        allViewed={myStories.stories.every(story => viewedStories.includes(story._id))}
                    >
                        <img src={`${API_URL}${myStories.avatar}`} alt="Seu story" />
                        <p>Seu story</p>
                    </StoryCircle>
                )}

                {otherStories.map(userStories => {
                    const allStoriesViewed = userStories.stories.every(story => viewedStories.includes(story._id));
                    return (
                        <StoryCircle 
                            key={userStories.userId} 
                            onClick={() => handleStoryClick(userStories)}
                            allViewed={allStoriesViewed}
                        >
                            <img src={`${API_URL}${userStories.avatar}`} alt={userStories.username} />
                            <p>{userStories.username}</p>
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