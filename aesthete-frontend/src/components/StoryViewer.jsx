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

    // Efeito para transição automática
    useEffect(() => {
        const timer = setTimeout(() => {
            if (currentIndex < userStories.stories.length - 1) {
                setCurrentIndex(currentIndex + 1);
            } else {
                onClose(); // Fecha quando chega no último
            }
        }, 5000); // Muda de story a cada 5 segundos

        return () => clearTimeout(timer);
    }, [currentIndex, userStories.stories.length, onClose]);

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