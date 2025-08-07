import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import api, { API_URL } from '../api/axios';

// --- Styled Components ---
const SearchPageWrapper = styled.div`
  padding: 15px;
`;

const SearchInputWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 8px 12px;
  background-color: #efefef;
  border: 1px solid #dbdbdb;
  border-radius: 8px;
  outline: none;
`;

const ResultsContainer = styled.div`
  margin-top: 15px;
`;

const SearchResultItem = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;
  cursor: pointer;
  &:hover { background-color: #fafafa; }
  img {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    margin-right: 12px;
  }
`;

// --- Componente ---
const SearchPage = () => {
    const navigate = useNavigate();
    const { user: loggedInUser } = useSelector((state) => state.auth);

    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);

    useEffect(() => {
        if (!query.trim() || query.trim().length < 2) {
          setResults([]);
          return;
        }
        const delayDebounceFn = setTimeout(async () => {
          try {
            const { data } = await api.get(`/users/search?q=${query}`);
            setResults(data);
          } catch (error) { console.error("Erro ao buscar usuários", error); }
        }, 300);
    
        return () => clearTimeout(delayDebounceFn);
    }, [query, loggedInUser?.token]);

    const handleResultClick = (user) => {
        navigate(`/perfil/${user.username}`);
    };

    return (
        <SearchPageWrapper>
            <SearchInputWrapper>
                <SearchInput
                    type="text"
                    placeholder="Buscar..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    autoFocus
                />
            </SearchInputWrapper>
            <ResultsContainer>
                {results.map((user) => (
                    <SearchResultItem key={user._id} onClick={() => handleResultClick(user)}>
                        <img src={user.avatar.startsWith('http') ? user.avatar : `${API_URL}${user.avatar}`} alt={user.username} />
                        <span>{user.username}</span>
                    </SearchResultItem>
                ))}
            </ResultsContainer>
        </SearchPageWrapper>
    );
};

export default SearchPage;