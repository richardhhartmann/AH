import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import api, { API_URL } from '../api/axios';
import { FaMedal } from 'react-icons/fa';
import { BsTrophy } from "react-icons/bs";

// --- Styled Components ---

const TrophyIcon = styled(BsTrophy)`
  color: rgb(254, 121, 13);
  margin-right: 10px;
`;

const RankingContainer = styled.div`
  background-color: #fff;
  border: 1px solid #dbdbdb;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 24px;
    background-color: rgb(255, 240, 233); /* Laranja bem clarinho */
  border: 2px solid rgb(254, 121, 13);  /* Borda laranja */
    @media (max-width: 768px) {
      margin: 24px auto;       /* Centraliza e dá espaço em cima */
      width: 90%;              /* Deixa um pouco de espaço nas laterais */
      padding: 10px 12px;      /* Menos altura e largura interna */
    }
`;

const Header = styled.h3`
  font-size: 0.9rem;
  margin-bottom: 12px;
  text-align: left;
  color: rgba(32, 32, 32, 1);
`;

const UserList = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
`;

const UserPodium = styled(Link)`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: #262626;
  width: 75px; /* Largura de cada item do pódio */
  text-align: center;

  img {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    margin-bottom: 5px;
    object-fit: cover;
  }

  /* Estilos para o Top 1 */
  &.gold {
    img {
      border-color: #ffd700;
      width: 60px;
      height: 60px;
    }
    strong { font-size: 0.9rem; }
  }
  
  /* Estilos para o Top 2 */
  &.silver img {
    border-color: #c0c0c0;
  }

  /* Estilos para o Top 3 */
  &.bronze img {
    border-color: #cd7f32;
  }

  span {
    font-size: 0.75rem;
    color: #8e8e8e;
  }

  strong {
    font-size: 0.8rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
  }
`;

const MedalIcon = styled(FaMedal)`
  font-size: 1.1rem;
  margin-bottom: 4px;
  color: ${props => props.color};
`;

// --- Componente ---
const TopPosters = () => {
    const [topUsers, setTopUsers] = useState([]);

    useEffect(() => {
        const fetchTopPosters = async () => {
            try {
                const { data } = await api.get('/users/top-posters');
                setTopUsers(data);
            } catch (error) {
                console.error("Erro ao buscar top posters", error);
            }
        };
        fetchTopPosters();
    }, []);

    const medalColors = ['#ffd700', '#c0c0c0', '#cd7f32'];
    const podiumClasses = ['gold', 'silver', 'bronze'];

    if (topUsers.length === 0) return null;

    return (
        <RankingContainer>
            <Header><TrophyIcon /> Ranking de engajamento do mês</Header>
            <UserList>
                {topUsers.map((item, index) => (
                    <UserPodium 
                        key={item.user._id} 
                        to={`/perfil/${item.user.username}`} 
                        className={podiumClasses[index]}
                    >
                        <img src={item.user.avatar.startsWith('http') ? item.user.avatar : `${API_URL}${item.user.avatar}`} alt={item.user.username} />
                        <strong>{item.user.username}</strong>
                        <span>{item.postCount} posts</span>
                    </UserPodium>
                ))}
            </UserList>
        </RankingContainer>
    );
};

export default TopPosters;