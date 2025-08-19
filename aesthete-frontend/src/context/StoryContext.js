import React, { createContext, useState, useEffect, useContext, useCallback } from 'react'; // Adicione useCallback
import { useSelector } from 'react-redux';
import api from '../api/axios';
import FullscreenStoryViewer from '../components/FullscreenStoryViewer'; // <-- 1. IMPORTE O VIEWER AQUI

const StoryContext = createContext();

export const StoryProvider = ({ children }) => {
    const { user: loggedInUser } = useSelector((state) => state.auth);
    const [storyFeed, setStoryFeed] = useState([]);
    const [viewedStories, setViewedStories] = useState(
        () => new Set(JSON.parse(localStorage.getItem('viewedStories')) || [])
    );
    
    // --- 2. ADICIONE O ESTADO PARA CONTROLAR O VIEWER ---
    const [viewerConfig, setViewerConfig] = useState({
        isOpen: false,
        stories: [],
        initialIndex: 0
    });

    // ... (useEffect para buscar stories continua o mesmo)
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
                console.error("Erro ao buscar stories no context", error);
            }
        };
        fetchStories();
    }, [loggedInUser]);

    const refreshViewedStories = useCallback(() => {
        setViewedStories(new Set(JSON.parse(localStorage.getItem('viewedStories')) || []));
    }, []);

    // --- 3. CRIE AS FUNÇÕES GLOBAIS PARA ABRIR E FECHAR O VIEWER ---
    const openStoryViewer = useCallback((userIndex) => {
        if (storyFeed.length > 0) {
            setViewerConfig({
                isOpen: true,
                stories: storyFeed,
                initialIndex: userIndex
            });
        }
    }, [storyFeed]);

    const closeStoryViewer = useCallback(() => {
        setViewerConfig(prev => ({ ...prev, isOpen: false }));
        refreshViewedStories();
    }, [refreshViewedStories]);

    const getStoryStatus = useCallback((userId) => {
        const userStoryGroup = storyFeed.find(group => group.userId === userId);
        if (!userStoryGroup || userStoryGroup.stories.length === 0) {
            return { hasStories: false, allStoriesViewed: true };
        }
        const allViewed = userStoryGroup.stories.every(story => viewedStories.has(story._id));
        return { hasStories: true, allStoriesViewed: allViewed };
    }, [storyFeed, viewedStories]);
    
    // ... (markStoryAsViewed pode ser removido, pois o viewer cuidará disso)

    const value = {
        storyFeed,
        getStoryStatus,
        openStoryViewer,
        refreshViewedStories // <-- Função adicionada
    };

    return (
        <StoryContext.Provider value={value}>
            {children}
            {/* --- 4. RENDERIZE O VIEWER GLOBALMENTE AQUI --- */}
            {viewerConfig.isOpen && (
                <FullscreenStoryViewer
                    allUsersStories={viewerConfig.stories}
                    initialUserIndex={viewerConfig.initialIndex}
                    onClose={closeStoryViewer}
                />
            )}
        </StoryContext.Provider>
    );
};

export const useStoryStatus = () => {
    return useContext(StoryContext);
};