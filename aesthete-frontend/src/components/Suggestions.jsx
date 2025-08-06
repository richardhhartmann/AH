import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import api, { API_URL } from '../api/axios'; // Usando nossa instância central do axios
import { IoChatbubbles } from "react-icons/io5";

// --- Styled Components ---

const SuggestionsContainer = styled.div`
  background-color: #fff;
  border: 1px solid #dbdbdb;
  border-radius: 8px;
  padding: 16px;
`;

const Header = styled.h3`
  color: #8e8e8e;
  font-size: 1rem;
  font-weight: bold;
  margin-bottom: 16px;
`;

const UserItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 12px;
`;

const UserInfo = styled.div`
  flex-grow: 1;
  margin-left: 12px;
  p {
    color: #8e8e8e;
    font-size: 0.8rem;
  }
`;

const UsernameLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  font-weight: bold;
`;

const SuggestionBio = styled.p`
  color: #8e8e8e;
  font-size: 0.8rem;
`;

const Avatar = styled.img`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  cursor: pointer;
`;

const FollowButton = styled.button`
  background: none;
  border: none;
  color: #0095f6;
  font-weight: bold;
  cursor: pointer;
`;

// --- Novo estilo para o botão de chat ---
const ChatButton = styled.button`
  background-color: rgb(254, 121, 13);
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.9rem;
  margin-left: 8px;
`;


// --- Componente ---
const Suggestions = () => {
    const { user: loggedInUser } = useSelector((state) => state.auth);
    const [suggestions, setSuggestions] = useState([]);

    useEffect(() => {
        const fetchSuggestions = async () => {
            try {
                const { data } = await api.get('/users/suggestions');
                setSuggestions(data);
            } catch (error) {
                console.error("Erro ao buscar sugestões", error);
            }
        };
        fetchSuggestions();
    }, []);

    const handleFollow = async (userIdToFollow) => {
        try {
            await api.put(`/users/follow/${userIdToFollow}`);
            // Remove o usuário seguido da lista de sugestões para feedback instantâneo
            setSuggestions(prev => prev.filter(user => user._id !== userIdToFollow));
        } catch (error) {
            console.error("Erro ao seguir usuário", error);
        }
    };

    const handleStartChat = (userId) => {
        console.log(`Iniciar chat com o usuário ID: ${userId}`);
        // ### AQUI VOCÊ IMPLEMENTARÁ A LÓGICA PARA CRIAR/ABRIR O CHAT
    };

    if (suggestions.length === 0) {
        return null; // Não mostra nada se não houver sugestões
    }

    return (
        <SuggestionsContainer>
            <Header>Sugestões para você</Header>
            {suggestions.map(user => (
                <UserItem key={user._id}>
                    <Link to={`/perfil/${user.username}`}>
                        <Avatar src={`${API_URL}${user.avatar}`} alt={user.username} />
                    </Link>
                    <UserInfo>
                        <div>
                            <UsernameLink to={`/perfil/${user.username}`}>
                                {user.username}
                            </UsernameLink>
                            {user.bio && <SuggestionBio>{user.bio}</SuggestionBio>}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <FollowButton onClick={() => handleFollow(user._id)}>
                                Seguir
                            </FollowButton>
                            <ChatButton onClick={() => handleStartChat(user._id)}><IoChatbubbles size = {18}/></ChatButton>
                        </div>
                    </UserInfo>
                </UserItem>
            ))}
        </SuggestionsContainer>
    );
};

export default Suggestions;