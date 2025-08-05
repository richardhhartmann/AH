import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import styled from 'styled-components';

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
  img {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    border: 3px solid #c72d8f; /* Borda colorida */
    padding: 2px;
  }
  p {
    font-size: 0.8rem;
    margin-top: 5px;
  }
`;

const StoriesBar = ({ onStoryClick }) => {
    const { user: loggedInUser } = useSelector((state) => state.auth);
    const [storyFeed, setStoryFeed] = useState([]);

    useEffect(() => {
        const fetchStories = async () => {
            if (!loggedInUser) return;
            try {
                const config = { headers: { Authorization: `Bearer ${loggedInUser.token}` } };
                const { data } = await axios.get('http://localhost:5000/api/stories/feed', config);
                setStoryFeed(data);
            } catch (error) {
                console.error("Erro ao buscar stories", error);
            }
        };
        fetchStories();
    }, [loggedInUser]);

    if (storyFeed.length === 0) return null;

    return (
        <StoriesContainer>
            {storyFeed.map(userStories => (
                <StoryCircle key={userStories.userId} onClick={() => onStoryClick(userStories)}>
                    <img src={`http://localhost:5000${userStories.avatar}`} alt={userStories.username} />
                    <p>{userStories.username}</p>
                </StoryCircle>
            ))}
        </StoriesContainer>
    );
};

export default StoriesBar;