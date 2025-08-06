import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import api, { API_URL } from '../api/axios'; // Usando nossa instância central do axios

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

    if (suggestions.length === 0) {
        return null; // Não mostra nada se não houver sugestões
    }

    return (
        <SuggestionsContainer>
            <Header>Sugestões para você</Header>
            {suggestions.map(user => (
                <UserItem key={user._id}>
                    {/* Lógica para visualizar stories pode ser adicionada aqui no futuro */}
                    <Link to={`/perfil/${user.username}`}>
                        <Avatar src={`${API_URL}${user.avatar}`} alt={user.username} />
                    </Link>
                    <UserInfo>
                        <Link to={`/perfil/${user.username}`}>
                            <strong>{user.username}</strong>
                        </Link>
                        <p>{user.bio}</p>
                    </UserInfo>
                    <FollowButton onClick={() => handleFollow(user._id)}>
                        Seguir
                    </FollowButton>
                </UserItem>
            ))}
        </SuggestionsContainer>
    );
};

export default Suggestions;