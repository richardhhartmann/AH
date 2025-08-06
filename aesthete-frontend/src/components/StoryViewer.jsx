import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const ViewerOverlay = styled.div` /* ... Estilos para a sobreposição de tela cheia ... */ `;
const StoryContent = styled.div` /* ... Estilos para o conteúdo central ... */ `;
const StoryImage = styled.img` /* ... Estilos para a imagem ... */ `;
const CloseButton = styled.button` /* ... Estilos para o botão de fechar ... */ `;
const NavArea = styled.div` /* ... Estilos para as áreas de clique de navegação ... */ `;

const ENDPOINT = process.env.REACT_APP_API_URL;

const StoryViewer = ({ userStories, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Efeito para transição automática E para marcar como visto
    useEffect(() => {
        // --- LÓGICA NOVA: Marcar o story atual como visto ---
        const markAsViewed = () => {
            const currentStoryId = userStories.stories[currentIndex]._id;
            // Pega a lista de stories já vistos do localStorage
            const viewedStories = JSON.parse(localStorage.getItem('viewedStories')) || [];
            // Adiciona o ID do story atual à lista, se ainda não estiver lá
            if (!viewedStories.includes(currentStoryId)) {
                viewedStories.push(currentStoryId);
                localStorage.setItem('viewedStories', JSON.stringify(viewedStories));
            }
        };
        
        // Chamamos a função para garantir que o story seja marcado assim que exibido
        markAsViewed();

        const timer = setTimeout(() => {
            handleNext();
        }, 5000);

        return () => clearTimeout(timer);
    }, [currentIndex, userStories]); // Adicionamos userStories à dependência

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const handleNext = () => {
        if (currentIndex < userStories.stories.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            onClose(); // Fecha manualmente
        }
    };

    return (
        <ViewerOverlay>
            <CloseButton onClick={onClose}>&times;</CloseButton>
            <StoryContent>
                <StoryImage
                    src={`${ENDPOINT}${userStories.stories[currentIndex].mediaUrl}`}
                    alt={`Story ${currentIndex + 1}`}
                />
                {/* Barras de progresso e informações do usuário podem ser adicionadas aqui */}
            </StoryContent>
            <NavArea style={{ left: 0 }} onClick={handlePrev} />
            <NavArea style={{ right: 0 }} onClick={handleNext} />
        </ViewerOverlay>
    );
};

export default StoryViewer;