import React, { useState, useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { useSelector } from 'react-redux'; // 1. Importe useSelector
import api, { API_URL } from '../api/axios';
import { FaTrash } from 'react-icons/fa'; // 2. Importe um ícone de lixeira

const FullscreenOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(20, 20, 20, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const StoryContentWrapper = styled.div`
  position: relative;
  max-width: 450px; /* Largura similar a um celular */
  width: 100%;
  aspect-ratio: 9 / 16; /* Proporção de story (vertical) */
  background-color: #111;
  border-radius: 8px;
  overflow: hidden;
`;

const StoryImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  color: white;
  font-size: 2.5rem;
  cursor: pointer;
  z-index: 1010;
`;

const NavArea = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  width: 50%;
  cursor: pointer;
  z-index: 1005;
  &.prev { left: 0; }
  &.next { right: 0; }
`;

const ProgressBarContainer = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
  height: 3px;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
  z-index: 1006;
`;

const progressBarAnimation = keyframes`
  from { width: 0%; }
  to { width: 100%; }
`;

const ProgressBar = styled.div`
  height: 100%;
  background-color: white;
  border-radius: 3px;
  /* Animação com duração de 5 segundos */
  animation: ${progressBarAnimation} 5s linear forwards;
`;

const DeleteButton = styled.button`
  position: absolute;
  bottom: 20px;
  right: 20px;
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  z-index: 1010;
  opacity: 0.7;

  &:hover {
    opacity: 1;
  }
`;

const FullscreenStoryViewer = ({ userStories, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const { user: loggedInUser } = useSelector((state) => state.auth);

    const handleNext = useCallback(() => {
        if (currentIndex < userStories.stories.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            onClose(); // Fecha quando chega no último story
        }
    }, [currentIndex, userStories, onClose]);

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    useEffect(() => {
        // Marca o story como visto assim que ele é exibido
        const currentStoryId = userStories.stories[currentIndex]._id;
        const viewedStories = JSON.parse(localStorage.getItem('viewedStories')) || [];
        if (!viewedStories.includes(currentStoryId)) {
            viewedStories.push(currentStoryId);
            localStorage.setItem('viewedStories', JSON.stringify(viewedStories));
        }

        // Timer para avançar automaticamente
        const timer = setTimeout(handleNext, 5000);
        return () => clearTimeout(timer); // Limpa o timer ao mudar de story
    }, [currentIndex, userStories, handleNext]);

    const handleDelete = async (e) => {
        e.stopPropagation(); // Impede que o clique feche o overlay
        const storyIdToDelete = userStories.stories[currentIndex]._id;

        if (window.confirm("Tem certeza que deseja apagar este story?")) {
            try {
                await api.delete(`/stories/${storyIdToDelete}`);
                alert("Story apagado com sucesso.");
                onClose(true); // Fecha o visualizador e passa 'true' para indicar que algo foi deletado
            } catch (error) {
                console.error("Erro ao apagar o story", error);
                alert("Não foi possível apagar o story.");
            }
        }
    };

    const currentStory = userStories.stories?.[currentIndex];
    if (!currentStory) return null;

    const isMyStory = userStories.userId === loggedInUser?._id;

    return (
        <FullscreenOverlay onClick={onClose}>
            <CloseButton onClick={onClose}>&times;</CloseButton>
            <StoryContentWrapper onClick={(e) => e.stopPropagation()}>
                <ProgressBarContainer>
                    <ProgressBar key={currentIndex} /> {/* A 'key' reinicia a animação */}
                </ProgressBarContainer>

                <NavArea className="prev" onClick={handlePrev} />
                <NavArea className="next" onClick={handleNext} />
                
                <StoryImage src={`${API_URL}${currentStory.mediaUrl}`} alt="Story" />
                {isMyStory && (
                    <DeleteButton onClick={handleDelete}>
                        <FaTrash />
                    </DeleteButton>
                )}
            </StoryContentWrapper>
        </FullscreenOverlay>
    );
};

export default FullscreenStoryViewer;