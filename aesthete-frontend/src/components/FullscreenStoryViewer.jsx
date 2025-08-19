import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import api, { API_URL } from '../api/axios';
import { FaTrash, FaChevronLeft, FaChevronRight, FaHeart } from 'react-icons/fa';
import { BsThreeDots } from "react-icons/bs";
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import { IoPaperPlaneOutline } from 'react-icons/io5';

const formatTimeAgo = (dateString) => {
  if (!dateString) return '';
  const now = new Date();
  const storyDate = new Date(dateString);
  const secondsPast = Math.floor((now.getTime() - storyDate.getTime()) / 1000);

  if (secondsPast < 60) return `${secondsPast}s`;

  const minutes = Math.floor(secondsPast / 60);
  if (minutes < 60) {
    return minutes === 1 ? '1 minuto' : `${minutes} minutos`;
  }

  const hours = Math.floor(secondsPast / 3600);
  if (hours <= 24) {
    return hours === 1 ? '1 hora' : `${hours} horas`;
  }

  const days = Math.floor(secondsPast / 86400);
  return days === 1 ? '1 dia' : `${days} dias`;
};

const StoryActionsContainer = styled.div`
  position: absolute;
  bottom: 20px;
  left: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  z-index: 1010;
`;

const ReplyInput = styled.input`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.4);
  border: 1px solid #555;
  border-radius: 20px;
  padding: 10px 15px;
  color: white;
  font-size: 0.9rem;
  outline: none;

  &::placeholder {
    color: #ccc;
  }
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 1.8rem; /* Aumenta o tamanho do ícone */
  cursor: pointer;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    filter: drop-shadow(0 1px 2px rgba(0,0,0,0.7));
  }
`;

const SentConfirmationPopup = styled.div`
  position: absolute;
  bottom: 100px; /* Posição acima da barra de resposta */
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  z-index: 1020;
  animation: fadeInOut 2s ease-in-out;

  @keyframes fadeInOut {
    0% { opacity: 0; transform: translate(-50%, 10px); }
    25% { opacity: 1; transform: translate(-50%, 0); }
    75% { opacity: 1; transform: translate(-50%, 0); }
    100% { opacity: 0; transform: translate(-50%, 10px); }
  }
`;

const FullscreenOverlay = styled.div`
  position: fixed; 
  top: 0; 
  left: 0; 
  width: 100%; 
  height: 100%; 
  background-color: rgb(26, 26, 26); 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  z-index: 1000;
`;

const StoryContentWrapper = styled.div`
  position: relative;
  max-width: 450px;
  width: 100%;
  aspect-ratio: 9 / 16;
  max-height: 100vh;
  background-color: #111;
  border-radius: 8px;
  overflow: hidden;

  /* Estilos para a animação de fade ao trocar de usuário */
  &.fade-enter {
    opacity: 0;
  }
  &.fade-enter-active {
    opacity: 1;
    transition: opacity 300ms ease-in-out;
  }
  &.fade-exit {
    opacity: 1;
  }
  &.fade-exit-active {
    opacity: 0;
    transition: opacity 300ms ease-in-out;
  }
`;

const SideArrow = styled.button`
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(30, 30, 30, 0.5);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  z-index: 1010;
  color: white;
  font-size: 1.5rem;
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(50, 50, 50, 0.8);
  }

  /* Distância das bordas da tela */
  &.left {
    left: 400px;
  }
  &.right {
    right: 400px;
  }

  &:disabled {
    opacity: 0;
    pointer-events: none;
  }
`;

const UserInfoContainer = styled(Link)`
  position: absolute;
  top: 20px;
  left: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 1010;
  text-decoration: none;
`;

const UserAvatar = styled.img`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
`;

const UserTextWrapper = styled.div`
  display: flex;
  flex-direction: column;
  line-height: 1.2;
`;

const UserName = styled.span`
padding-top: 5px;
  color: white;
  font-weight: 500;
  font-size: 1rem;
  text-shadow: 0 1px 2px rgba(0,0,0,0.6);
`;

const StoryTimestamp = styled.span`
  color: #dbdbdbff;
  font-weight: 300;
  font-size: 0.85rem;
`;

const StoryImage = styled.img`
  width: 100%; height: 100%; object-fit: cover;
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

  @media (min-width: 1024px) {
    position: fixed;
    top: 20px;
    left: auto;
    right: 50px;
  }
`;

const ProgressBarContainer = styled.div`
  position: absolute; top: 10px; left: 10px; right: 10px; height: 3px; z-index: 1006; display: flex; gap: 4px;
`;

const ProgressSegment = styled.div`
  flex: 1; background-color: rgba(255, 255, 255, 0.8); border-radius: 3px; overflow: hidden;
`;

const progressBarAnimation = keyframes`from { width: 0%; } to { width: 100%; }`;

const ProgressFiller = styled.div`
  height: 100%; background-color: rgb(254, 121, 13); border-radius: 3px; width: ${props => props.isViewed ? '100%' : '0%'};
  ${props => props.isActive && css`
    animation: ${progressBarAnimation} 5s linear forwards;
    animation-play-state: ${props.isPaused ? 'paused' : 'running'};
  `}
`;

const MenuButton = styled.button`
  position: absolute;
  top: 18px;
  right: 5px; /* Posição à esquerda do botão de fechar */
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem; /* Tamanho do ícone */
  cursor: pointer;
  z-index: 1011; /* Acima do CloseButton */
  padding: 5px;
  line-height: 1;
`;

const MenuPopup = styled.div`
  position: absolute;
  top: 60px; /* Posição abaixo do botão de menu */
  right: 15px;
  background-color: #262626;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1012;
  overflow: hidden;
`;

const MenuItem = styled.button`
  display: block;
  width: 100%;
  padding: 12px 20px;
  background: none;
  border: none;
  border-bottom: 1px solid #363636;
  color: white;
  text-align: left;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: #363636;
  }

  &.danger {
    color: #ed4956;
    font-weight: 700;
  }
`;

const FullscreenStoryViewer = ({ allUsersStories, initialUserIndex, onClose }) => {
    const nodeRef = useRef(null);
    const { user: loggedInUser } = useSelector((state) => state.auth);
    const [currentUserIndex, setCurrentUserIndex] = useState(initialUserIndex || 0);
    const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
    const [storyData, setStoryData] = useState(allUsersStories);
    const STORY_DURATION = 5000;
    const [isPaused, setIsPaused] = useState(false);
    const timerIdRef = useRef(null);
    const startTimeRef = useRef(null);
    const remainingTimeRef = useRef(STORY_DURATION);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [isInputFocused, setIsInputFocused] = useState(false);
    const [showSentConfirmation, setShowSentConfirmation] = useState(false);

    const handleSendReply = async () => {
        if (!currentStory || replyText.trim() === '') return;

        try {
            await api.post(`/stories/${currentStory._id}/reply`, { text: replyText });
            setReplyText('');

            // Ativa a notificação visual
            setShowSentConfirmation(true);
            setTimeout(() => setShowSentConfirmation(false), 2000); // Esconde após 2 segundos

            // Mantém o story pausado, mas com o input desfocado
            setIsInputFocused(false);

        } catch (error) {
            console.error("Erro ao enviar resposta do story", error);
            alert("Não foi possível enviar a resposta. Tente novamente.");
        }
    };

    const handleNext = useCallback(() => {
        const storiesOfCurrentUser = storyData?.[currentUserIndex]?.stories;
        if (currentStoryIndex < (storiesOfCurrentUser?.length || 0) - 1) {
            setCurrentStoryIndex(prev => prev + 1);
        } else if (currentUserIndex < (storyData?.length || 0) - 1) {
            setCurrentUserIndex(prev => prev + 1);
            setCurrentStoryIndex(0);
        } else {
            onClose();
        }
    }, [currentUserIndex, currentStoryIndex, storyData, onClose]);

    const currentUserStories = storyData?.[currentUserIndex];
    const currentStory = currentUserStories?.stories?.[currentStoryIndex];

    useEffect(() => {
      if (!currentStory) return;

      try {
          const viewed = JSON.parse(localStorage.getItem('viewedStories')) || [];

          const viewedSet = new Set(viewed);

          viewedSet.add(currentStory._id);

          localStorage.setItem('viewedStories', JSON.stringify(Array.from(viewedSet)));

      } catch (error) {
          console.error("Falha ao salvar story como visto no localStorage", error);
      }

      clearTimeout(timerIdRef.current);
      remainingTimeRef.current = STORY_DURATION;

  }, [currentStory]);

    useEffect(() => {
        if (!currentStory) return;

        if (isPaused) {
            clearTimeout(timerIdRef.current);
            const elapsedTime = Date.now() - startTimeRef.current;
            remainingTimeRef.current -= elapsedTime;
        } else {
            startTimeRef.current = Date.now();
            timerIdRef.current = setTimeout(() => {
                handleNext();
            }, remainingTimeRef.current);
        }
        return () => clearTimeout(timerIdRef.current);
    }, [isPaused, currentStory, handleNext]);

    if (!currentUserStories || !currentStory) {
        return null;
    }

    const handlePrev = () => {
        if (currentStoryIndex > 0) {
            setCurrentStoryIndex(prev => prev - 1);
        } else if (currentUserIndex > 0) {
            const prevUserIndex = currentUserIndex - 1;
            const storiesOfPrevUser = storyData[prevUserIndex].stories;
            setCurrentUserIndex(prevUserIndex);
            setCurrentStoryIndex(storiesOfPrevUser.length - 1);
        }
    };

    const handleDelete = async () => {
      // Não precisa mais do evento 'e'
      setIsMenuOpen(false); // Fecha o menu primeiro
      
      // Pausa o story para dar tempo ao usuário de ler o confirm
      setIsPaused(true); 

      const storyIdToDelete = currentStory._id;

      if (window.confirm("Tem certeza que deseja apagar este story?")) {
          try {
              await api.delete(`/stories/${storyIdToDelete}`);
              onClose(true); // Fecha e sinaliza para recarregar
          } catch (error) {
              if (error.response && error.response.status === 404) {
                  alert("Não foi possível apagar: o story já expirou e não existe mais.");
              } else {
                  console.error("Erro ao apagar o story", error);
                  alert("Ocorreu um erro inesperado ao tentar apagar o story.");
              }
              onClose(); // Fecha o viewer se der erro
          }
      } else {
          // Se o usuário clicar em "cancelar", retoma o story
          setIsPaused(false);
      }
  };

  const handleLike = async (e) => {
    e.stopPropagation(); // Impede que o clique se propague e pause o story
    if (!currentStory) return;

    const storyId = currentStory._id;
    
    try {
        const newStoryData = [...storyData];
        const storyToUpdate = newStoryData[currentUserIndex].stories[currentStoryIndex];
        const myId = loggedInUser._id;

        // --- CORREÇÃO AQUI ---
        // 1. Verificamos se a propriedade 'likes' existe. Se não, a criamos como um array vazio.
        if (!storyToUpdate.likes) {
            storyToUpdate.likes = [];
        }
        // A partir daqui, 'storyToUpdate.likes' tem a garantia de ser um array.
        // --- FIM DA CORREÇÃO ---

        const isLiked = storyToUpdate.likes.includes(myId);

        if (isLiked) {
            storyToUpdate.likes = storyToUpdate.likes.filter(id => id !== myId);
        } else {
            storyToUpdate.likes.push(myId);
        }
        setStoryData(newStoryData);

        // Chama a API em segundo plano
        await api.put(`/stories/${storyId}/like`);

    } catch (error) {
        console.error("Erro ao curtir o story", error);
        // Opcional: reverter a UI em caso de erro
    }
};

    const isMyStory = currentUserStories.userId === loggedInUser?._id;
    const getImageUrl = (url) => url && (url.startsWith('http') ? url : `${API_URL}${url}`);
    const canGoPrev = currentUserIndex > 0 || currentStoryIndex > 0;

    return (
        <FullscreenOverlay onClick={onClose}>
            <TransitionGroup component={null}>
                <CSSTransition
                    nodeRef={nodeRef}
                    key={currentUserIndex}
                    timeout={300}
                    classNames="fade"
                >
                    <StoryContentWrapper
                        ref={nodeRef}
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={() => setIsPaused(true)}
                        onMouseUp={() => { if (!isInputFocused) setIsPaused(false); }}
                        onMouseLeave={() => { if (isPaused && !isInputFocused) setIsPaused(false); }}
                    >
                        <ProgressBarContainer>
                            {currentUserStories.stories.map((story, index) => (
                                <ProgressSegment key={story._id}>
                                    <ProgressFiller
                                        isActive={index === currentStoryIndex}
                                        isViewed={index < currentStoryIndex}
                                        key={`${currentUserIndex}-${currentStoryIndex}`}
                                        isPaused={isPaused}
                                    />
                                </ProgressSegment>
                            ))}
                        </ProgressBarContainer>

                        <UserInfoContainer to={`/perfil/${currentUserStories.username}`}>
                          <UserAvatar src={getImageUrl(currentUserStories.avatar)} alt="User avatar" />
                          <UserTextWrapper>
                            <UserName>{currentUserStories.username}</UserName>
                            <StoryTimestamp>Há {formatTimeAgo(currentStory.createdAt)}</StoryTimestamp>
                          </UserTextWrapper>
                        </UserInfoContainer>

                        <CloseButton onClick={(e) => { e.stopPropagation(); onClose() }}>&times;</CloseButton>

                        {isMyStory && (
                            <>
                                <MenuButton onClick={(e) => {
                                    e.stopPropagation(); // Impede que o clique feche o story
                                    setIsMenuOpen(!isMenuOpen); // Abre ou fecha o menu
                                }}>
                                    <BsThreeDots />
                                </MenuButton>
                                {isMenuOpen && (
                                    <MenuPopup>
                                        <MenuItem className="danger" onClick={handleDelete}>
                                            Excluir
                                        </MenuItem>
                                    </MenuPopup>
                                )}
                            </>
                        )}

                        {showSentConfirmation && <SentConfirmationPopup>Enviado!</SentConfirmationPopup>}
                          
                        <StoryImage src={getImageUrl(currentStory.mediaUrl)} alt="Story" />
                        { !isMyStory && (
                          <StoryActionsContainer>
                            <ReplyInput 
                              placeholder="Enviar mensagem..." 
                              onClick={e => e.stopPropagation()}
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              
                              // ALTERE AS DUAS LINHAS ABAIXO
                              onFocus={() => {
                                  setIsPaused(true);
                                  setIsInputFocused(true);
                              }}
                              onBlur={() => {
                                  setIsPaused(false);
                                  setIsInputFocused(false);
                              }}
                              
                              onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                      e.preventDefault();
                                      handleSendReply();
                                  }
                              }}
                          />
                          { replyText.trim() && (
                            <>
                              {/* Altere o botão de encaminhar para chamar a função de envio */}
                              <ActionButton onClick={(e) => {
                                  e.stopPropagation();
                                  handleSendReply();
                              }}>
                                  <IoPaperPlaneOutline />
                              </ActionButton>
                            </>
                          )}

                          <ActionButton onClick={handleLike}>
                              <FaHeart style={{ color: currentStory.likes?.includes(loggedInUser._id) ? '#ff3040' : 'white' }} />
                          </ActionButton>
                      </StoryActionsContainer>
                      )}
                    </StoryContentWrapper>
                </CSSTransition>
            </TransitionGroup>

            <SideArrow className="left" onClick={(e) => { e.stopPropagation(); handlePrev() }} disabled={!canGoPrev}>
                <FaChevronLeft />
            </SideArrow>
            <SideArrow className="right" onClick={(e) => { e.stopPropagation(); handleNext() }}>
                <FaChevronRight />
            </SideArrow>
        </FullscreenOverlay>
    );
};

export default FullscreenStoryViewer;