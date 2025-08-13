import styled from 'styled-components';
import { Link } from 'react-router-dom';

export const PostContainer = styled.div`
    background-color: #fff;
    border: 1px solid #dbdbdb;
    border-radius: 8px;
    margin-bottom: 24px;
    max-width: 615px;
    overflow: hidden; // Garante que nada "vaze" para fora do container
`;

export const PostHeader = styled.div`
    display: flex;
    align-items: center;
    padding: 14px 16px;
    
    img {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        margin-right: 14px;
        object-fit: cover;
    }
`;

// NOVO: Container para agrupar username, cargo e timestamp
export const UserInfoContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    line-height: 1.3;
    
    strong {
        font-size: 0.9rem;
    }
`;

// NOVO: Estilo para o cargo do usuário
export const UserRole = styled.span`
    font-size: 0.75rem;
    font-weight: bold;
    color: rgb(254, 121, 13);
`;

// NOVO: Estilo para o timestamp
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

export const ChatButton = styled(Link)`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background-color: rgb(254, 121, 13); /* Laranja */
    border-radius: 50%;
    color: white; /* Cor do ícone */
    transition: transform 0.2s ease-in-out;

    &:hover {
        transform: scale(1.1);
        color: white;
    }

    svg {
        width: 20px;
        height: 20px;
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
    /* Imagens de feed não costumam ter bordas superior/inferior se já há o container */
`;

// MODIFICADO: PostActions agora usa flex
export const PostActions = styled.div`
    display: flex; /* Alinha os botões lado a lado */
    align-items: center;
    padding: 4px 8px; /* Reduz o padding para acomodar melhor */
`;

// NOVO: Container para cada botão de ação e seu contador
export const ActionButtonContainer = styled.div`
    position: relative; /* Essencial para posicionar o contador */
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

// NOVO: Estilo para o contador flutuante (badge)
export const CounterBadge = styled.span`
    position: absolute;
    top: 2px;      /* Ajuste fino da posição vertical */
    right: -5px;    /* Ajuste fino da posição horizontal */
    background-color: rgb(254, 121, 13); /* Cor de notificação */
    color: white;
    font-size: 0.5rem;
    border-radius: 100%;
    padding: 1px 5px;
    min-width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid white; /* Borda para destacar */
`;


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

    /* O span de comentários foi removido da lógica, mas o estilo pode permanecer */
    span {
        color: #8e8e8e;
        font-size: 0.8rem;
        cursor: pointer;
    }
`;