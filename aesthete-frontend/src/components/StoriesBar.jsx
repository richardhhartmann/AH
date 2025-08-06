import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';

const ENDPOINT = process.env.REACT_APP_API_URL;

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
                const { data } = await axios.get(`${ENDPOINT}/api/stories/feed`, config);
                setStoryFeed(data);
            } catch (error) {
                console.error("Erro ao buscar stories", error);
            }
        };
        fetchStories();
    }, [loggedInUser]);

    // Separa o seu story dos outros
    const myStories = storyFeed.find(userStories => userStories.userId === loggedInUser._id);
    const otherStories = storyFeed.filter(userStories => userStories.userId !== loggedInUser._id);

    // Não renderiza a barra se não houver stories de ninguém
    if (storyFeed.length === 0) return null;

    return (
        <StoriesContainer>
            {/* Renderiza seu story primeiro, com um link para criar um novo */}
            {myStories ? (
                <StoryCircle onClick={() => onStoryClick(myStories)}>
                    <img src={`${ENDPOINT}${myStories.avatar}`} alt={myStories.username} />
                    <p>Seu story</p>
                </StoryCircle>
            ) : (
                <Link to="/stories/novo" style={{textDecoration: 'none'}}>
                    <StoryCircle>
                        <img src={`${ENDPOINT}${loggedInUser.avatar}`} alt="Adicionar story" style={{ border: '2px dashed #dbdbdb' }} />
                        <p>Adicionar</p>
                    </StoryCircle>
                </Link>
            )}

            {/* Renderiza os stories dos outros */}
            {otherStories.map(userStories => (
                <StoryCircle key={userStories.userId} onClick={() => onStoryClick(userStories)}>
                    <img src={`${ENDPOINT}${userStories.avatar}`} alt={userStories.username} />
                    <p>{userStories.username}</p>
                </StoryCircle>
            ))}
        </StoriesContainer>
    );
};

export default StoriesBar;