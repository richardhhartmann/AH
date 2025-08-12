import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import api, { API_URL } from '../api/axios';
import FullscreenStoryViewer from './FullscreenStoryViewer';

// --- Styled Components (sem alterações) ---
const StoriesWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  margin-bottom: 24px;
`;

const StoriesContainer = styled.div`
  display: flex;
  gap: 15px;
  padding: 16px;
  background-color: rgb(250, 250, 250);
  border-radius: 8px;
  overflow-x: scroll;
  scroll-behavior: smooth;
  
  &::-webkit-scrollbar { display: none; }
  -ms-overflow-style: none;
  scrollbar-width: none;
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

const ArrowButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(255, 255, 255, 0.9);
  border: 1px solid #dbdbdb;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  z-index: 10;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);

  &:hover { background-color: #f0f0f0; }
  
  &.left { left: 0px; }
  &.right { right: 0px; }
`;


// --- Componente ---
const StoriesBar = () => {
    const { user: loggedInUser } = useSelector((state) => state.auth);
    const [storyFeed, setStoryFeed] = useState([]);
    const [viewedStories, setViewedStories] = useState(
        () => JSON.parse(localStorage.getItem('viewedStories')) || []
    );
    
    // --- ALTERAÇÃO 1: Estado para controlar o visualizador ---
    // Em vez de apenas o usuário, controlamos a visibilidade e o índice inicial
    const [viewerConfig, setViewerConfig] = useState({ isOpen: false, initialIndex: 0 });

    const scrollRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const checkScroll = () => {
        const el = scrollRef.current;
        if (el) {
            const isScrollable = el.scrollWidth > el.clientWidth;
            setCanScrollLeft(isScrollable && el.scrollLeft > 0);
            setCanScrollRight(isScrollable && el.scrollLeft < (el.scrollWidth - el.clientWidth));
        }
    };

    useEffect(() => {
        const el = scrollRef.current;
        if (el) {
            checkScroll();
            el.addEventListener('scroll', checkScroll);
            window.addEventListener('resize', checkScroll);

            return () => {
                el.removeEventListener('scroll', checkScroll);
                window.removeEventListener('resize', checkScroll);
            };
        }
    }, [storyFeed]);


    useEffect(() => {
        const fetchStories = async () => {
            if (!loggedInUser) return;
            try {
                const { data } = await api.get('/stories/feed');
                const sortedFeed = data.sort((a, b) => {
                    if (a.userId === loggedInUser._id) return -1;
                    if (b.userId === loggedInUser._id) return 1;
                    return 0;
                });
                setStoryFeed(sortedFeed);
            } catch (error) {
                console.error("Erro ao buscar stories", error);
            }
        };
        fetchStories();
    }, [loggedInUser]);

    const scroll = (direction) => {
        const el = scrollRef.current;
        if (el) {
            const scrollAmount = 85 * 3; 
            const newScrollLeft = direction === 'left' 
                ? el.scrollLeft - scrollAmount 
                : el.scrollLeft + scrollAmount;
            
            el.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
        }
    };
    
    // --- ALTERAÇÃO 2: Funções para abrir e fechar o visualizador ---
    const handleStoryClick = (userIndex) => {
        setViewerConfig({ isOpen: true, initialIndex: userIndex });
    };

    const handleCloseViewer = () => {
        setViewedStories(JSON.parse(localStorage.getItem('viewedStories')) || []);
        setViewerConfig({ isOpen: false, initialIndex: 0 });
    };

    const getImageUrl = (url) => url && (url.startsWith('http') ? url : `${API_URL}${url}`);

    if (!storyFeed.length) {
        return null;
    }

    return (
        <>
            <StoriesWrapper>
                {canScrollLeft && (
                    <ArrowButton className="left" onClick={() => scroll('left')}>
                        &#x276E;
                    </ArrowButton>
                )}

                <StoriesContainer ref={scrollRef}>
                    {/* --- ALTERAÇÃO 3: Passar o índice para o handleStoryClick --- */}
                    {storyFeed.map((userStories, index) => {
                        const allStoriesViewed = userStories.stories.every(story => viewedStories.includes(story._id));
                        return (
                            <StoryCircle 
                                key={userStories.userId} 
                                onClick={() => handleStoryClick(index)} // Passa o índice do usuário na lista
                                allViewed={allStoriesViewed}
                            >
                                <img src={getImageUrl(userStories.avatar)} alt={userStories.username} />
                                <p>{userStories.userId === loggedInUser._id ? 'Seu story' : userStories.username}</p>
                            </StoryCircle>
                        );
                    })}
                </StoriesContainer>
                
                {canScrollRight && (
                    <ArrowButton className="right" onClick={() => scroll('right')}>
                        &#x276F;
                    </ArrowButton>
                )}
            </StoriesWrapper>

            {/* --- ALTERAÇÃO 4: Renderizar o visualizador com as novas props --- */}
            {viewerConfig.isOpen && (
                <FullscreenStoryViewer 
                    allUsersStories={storyFeed} 
                    initialUserIndex={viewerConfig.initialIndex}
                    onClose={handleCloseViewer} 
                />
            )}
        </>
    );
};

export default StoriesBar;