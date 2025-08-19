import styled, { css, keyframes } from 'styled-components'; 
import { Link } from 'react-router-dom';

const likeAnimation = keyframes`
  0% {
    opacity: 0;
    transform: scale(0.1) translateY(0);
  }
  50% {
    opacity: 1;
    transform: scale(1.2) translateY(-20px);
  }
  100% {
    opacity: 0;
    transform: scale(1) translateY(50px);
  }
`;

// Container para posicionar a animação sobre a imagem
export const PostImageContainer = styled.div`
  position: relative; // Essencial para posicionar o ícone de animação
  cursor: pointer;
`;

// Estilo para o ícone animado
export const LikeAnimationIcon = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  opacity: 0;
  pointer-events: none; // Garante que o ícone não interfira com cliques

  svg {
    width: 80px;
    height: 80px;
    // Adiciona um contorno sutil para melhor visibilidade em imagens claras
    filter: drop-shadow(0 0 5px rgba(0, 0, 0, 0.5)); 
  }

  // Aplica a animação quando a classe 'animate' é adicionada
  &.animate {
    animation: ${likeAnimation} 0.8s ease-in-out forwards;
  }
`;

export const PostContainer = styled.div`
    background-color: #fff;
    border: 1px solid #dbdbdb;
    border-radius: 8px;
    margin-bottom: 24px;
    max-width: 615px;
    overflow: hidden; // Garante que nada "vaze" para fora do container

    @media (max-width: 768px) {
      border: none;
      border-radius: 0;
      background-color: transparent;
      margin-bottom: 0;
    }
`;

export const PostAvatarWrapper = styled(Link)`
  position: relative;
  flex-shrink: 0;
  
  img {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    margin-right: 14px;
    object-fit: cover;
    // Lógica da borda
    border: 3px solid ${props => props.storyStatus === 'unviewed' ? 'rgb(254, 121, 13)' : 'transparent'};
    padding: 2px;
  }
`;

export const PostHeader = styled.div`
    display: flex;
    align-items: center;
    padding: 14px 16px;
    
    img {
        width: 56px;
        height: 56px;
        border-radius: 50%;
        margin-right: 14px;
        object-fit: cover;
    }

    @media (max-width: 768px) {
        img {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            margin-right: 14px;
            object-fit: cover;
        }
    }
`;

export const UserInfoContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    line-height: 1.3;
    
    strong {
        font-size: 0.9rem;
    }

    @media (max-width: 768px) {
        strong {
            font-size: 1.1rem;
        }
    }
`;

export const UserRole = styled.span`
    font-size: 0.75rem;
    font-weight: bold;
    color: rgb(254, 121, 13);
`;

export const Timestamp = styled.span`
    font-size: 0.7rem;
    color: #313131ff;
    margin-top: 1px;
`;

export const HeaderActionsContainer = styled.div`
    margin-left: auto; /* Joga o container para a direita */
    display: flex;
    align-items: center;
    gap: 12px; /* Espaçamento entre os botões */
`;

export const ChatButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background-color: rgb(254, 121, 13); /* Laranja */
    border-radius: 50%;
    color: white; /* Cor do ícone */
    transition: transform 0.2s ease-in-out;
    border: none; // ADICIONADO: Remove a borda padrão do botão
    cursor: pointer; // ADICIONADO: Garante que o cursor seja uma mãozinha

    &:hover {
        transform: scale(1.1);
        color: white;
    }

    svg {
        width: 30px;
        height: 30px;
    }
`;

export const DeleteButton = styled.button`
    background: none;
    border: none;
    color: #ed4956;
    font-weight: bold;
    cursor: pointer;
    margin-left: auto;
    font-size: 0.9rem;
`;

export const PostImage = styled.img`
    width: 100%;
    height: auto;
    object-fit: cover;
    cursor: pointer;
`;

export const PostActions = styled.div`
    display: flex;
    align-items: center;
    padding: 4px 8px;
`;

export const ActionButtonContainer = styled.div`
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;

    button {
        background: none;
        border: none;
        cursor: pointer;
        padding: 8px;
        
        &:hover {
            opacity: 0.7;
        }
    }
    
    svg {
        width: 24px;
        height: 24px;
    }
`;

export const CaptionContainer = styled.div`
  padding: 0 15px;
  margin-bottom: 20px;
`;

export const Legenda = styled.div`
font-size: 0.9rem;
  max-width: 500px;
  word-wrap: break-word;

  ${({ isExpanded }) => !isExpanded && css`
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  `}
`;

export const ReadMoreButton = styled.strong`
font-size: 0.9rem;  
display: inline-block;
  font-weight: bold;
  color: #313131ff;
  cursor: pointer;
  margin-top: 4px;
`;

export const CounterBadge = styled.span`
  position: absolute;
  top: 3px;
  right: -5px;
  background-color: rgb(254, 121, 13);
  color: white;
  font-size: 0.6rem;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid white;
`;

// --- NOVOS ESTILOS PARA A PRÉVIA DE COMENTÁRIOS ---
export const CommentsPreviewContainer = styled.div`
    padding: 0 16px 12px;
    font-size: 0.85rem;
    color: #262626;
    display: flex;
    flex-direction: column;
    gap: 10px; /* Espaço entre os comentários */
`;

export const CommentPreviewItem = styled.div`
    word-wrap: break-word;
    
    strong {
        font-weight: 600;
        margin-right: 5px;
    }

    a {
      text-decoration: none;
      color: #262626;
    }
`;

export const ViewAllCommentsLink = styled(Link)`
    color: #8e8e8e;
    font-size: 0.9rem;
    text-decoration: none;
    margin-top: 5px;
    cursor: pointer;

    &:hover {
        text-decoration: underline;
    }
`;
// --- FIM DOS NOVOS ESTILOS ---

export const PostFooter = styled.div`
    padding: 0 16px 16px;
    font-size: 0.85rem;
    
    p {
        margin: 0 0 4px;
        line-height: 1.4;
    }
    
    strong {
        cursor: pointer;
    }

    span {
        color: #8e8e8e;
        font-size: 0.8rem;
        cursor: pointer;
    }
`;