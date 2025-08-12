import React from 'react';
import styled from 'styled-components';
import CommentsSection from './CommentsSection';

// Fundo escurecido
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  opacity: ${props => (props.isOpen ? 1 : 0)};
  visibility: ${props => (props.isOpen ? 'visible' : 'hidden')};
  transition: opacity 0.3s ease-in-out;
`;

// Conteúdo do Modal
const ModalContent = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 70vh; /* Ocupa 70% da altura da tela */
  background-color: #fff;
  z-index: 1001;
  border-top-left-radius: 16px; /* Bordas arredondadas */
  border-top-right-radius: 16px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  
  /* Animação de subida/descida */
  transform: ${props => (props.isOpen ? 'translateY(0)' : 'translateY(100%)')};
  transition: transform 0.3s ease-in-out;
  
  display: flex;
  flex-direction: column;
`;

const ModalHeader = styled.div`
  padding: 16px;
  text-align: center;
  border-bottom: 1px solid #dbdbdb;
  position: relative;
  
  h4 {
    margin: 0;
  }
  
  /* Pequeno traço no topo para indicar que é um modal */
  &::before {
    content: '';
    position: absolute;
    top: 8px;
    left: 50%;
    transform: translateX(-50%);
    width: 40px;
    height: 4px;
    background-color: #dbdbdb;
    border-radius: 2px;
  }
`;

const CommentsModal = ({ isOpen, onClose, postId, onCommentAdded }) => {
  if (!isOpen) return null;

  return (
    <>
      <ModalOverlay isOpen={isOpen} onClick={onClose} />
      <ModalContent isOpen={isOpen}>
        <ModalHeader>
          <h4>Comentários</h4>
        </ModalHeader>
        <CommentsSection postId={postId} onCommentAdded={onCommentAdded} />
      </ModalContent>
    </>
  );
};

export default CommentsModal;