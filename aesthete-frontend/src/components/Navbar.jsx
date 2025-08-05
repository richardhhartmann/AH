import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, reset } from '../features/auth/authSlice';
import styled from 'styled-components';
import axios from 'axios';

import { IoAddCircleOutline } from "react-icons/io5";
import { CgProfile } from "react-icons/cg";
import { FiLogOut } from "react-icons/fi";
import { GoHome } from "react-icons/go";
import { MdOutlineWebStories } from "react-icons/md";

const ENDPOINT = process.env.REACT_APP_API_URL;

const NavWrapper = styled.nav`
  background-color: #fff;
  border-bottom: 1px solid #dbdbdb;
  position: sticky;
  top: 0;
  z-index: 10;
`;

const NavContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 975px;
  padding: 0 20px;
  margin: 0 auto;
  height: 60px;
`;

const Logo = styled(Link)`
  font-family: "PT Sans", sans-serif;
  font-weight: 700;
  font-size: 2.5rem;
  text-decoration: none;
  color: #262626;
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 22px; /* Aumentamos o espaço entre os ícones */

  /* Estilo para os links e botões que contêm os ícones */
  a, button {
    color: #262626;
    font-size: 1.6rem; /* Aumenta o tamanho dos ícones */
    display: flex; /* Ajuda no alinhamento vertical */
    align-items: center;
  }
`;

const LogoutButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0; /* Remove padding extra */
`;

const SearchWrapper = styled.div`
  position: relative;
  width: 250px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 8px 12px;
  background-color: #efefef;
  border: 1px solid #dbdbdb;
  border-radius: 8px;
  outline: none;
`;

const SearchResultsDropdown = styled.div`
  position: absolute;
  top: 110%;
  left: 0;
  width: 100%;
  background-color: #fff;
  border: 1px solid #dbdbdb;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  z-index: 20;
`;

const SearchResultItem = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;
  text-decoration: none;
  color: #262626;

  &:hover {
    background-color: #fafafa;
  }

  img {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    margin-right: 12px;
  }
`;

const RecentSearchHeader = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 10px;
  font-weight: bold;
  font-size: 0.9rem;
  
  button {
    background: none;
    border: none;
    color: #0095f6;
    cursor: pointer;
    font-weight: bold;
  }
`;

// --- Componente (Sua lógica aqui está perfeita) ---
const Navbar = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user: loggedInUser } = useSelector((state) => state.auth);

    // --- LÓGICA DA BUSCA ---
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isFocused, setIsFocused] = useState(false); // Novo: para saber se a busca está ativa

    // --- LÓGICA DAS PESQUISAS RECENTES ---
    const [recentSearches, setRecentSearches] = useState(
        // Carrega as pesquisas salvas do localStorage ao iniciar
        JSON.parse(localStorage.getItem('recentSearches')) || []
    );

    // Efeito para a busca com debounce (continua o mesmo)
    useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${loggedInUser.token}` } };
        const { data } = await axios.get(`${ENDPOINT}/api/users/search?q=${query}`, config);
        setResults(data);
      } catch (error) {
        console.error("Erro ao buscar usuários", error);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query, loggedInUser?.token]);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(reset());
    navigate('/login');
  };

  const addRecentSearch = (user) => {
        const newRecent = [user, ...recentSearches.filter(u => u._id !== user._id)];
        // Limita a 5 pesquisas recentes
        const limitedRecent = newRecent.slice(0, 5);
        setRecentSearches(limitedRecent);
        localStorage.setItem('recentSearches', JSON.stringify(limitedRecent));
    };

    // Função para LIMPAR as pesquisas recentes
    const clearRecentSearches = () => {
        setRecentSearches([]);
        localStorage.removeItem('recentSearches');
    };

    // Função chamada ao clicar em um resultado (seja da API ou recente)
    const handleResultClick = (user) => {
        addRecentSearch(user); // Salva o usuário clicado
        setQuery('');
        setResults([]);
        setIsFocused(false);
        navigate(`/perfil/${user.username}`);
    };

  return (
        <NavWrapper>
            <NavContainer>
                <Logo to="/">AH</Logo>
                {loggedInUser && (
                    <SearchWrapper>
                        <SearchInput
                            type="text"
                            placeholder="Buscar usuários..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setTimeout(() => setIsFocused(false), 200)} // Pequeno delay para permitir o clique
                        />
                        {isFocused && (
                            <SearchResultsDropdown>
                                {query.length > 1 && results.length > 0 ? (
                                    // Mostra resultados da API se estiver digitando
                                    results.map((user) => (
                                        <SearchResultItem key={user._id} onMouseDown={() => handleResultClick(user)}>
                                            <img src={`${ENDPOINT}${user.avatar}`} alt={user.username} />
                                            <span>{user.username}</span>
                                        </SearchResultItem>
                                    ))
                                ) : (
                                    // Mostra pesquisas recentes se a busca estiver vazia
                                    recentSearches.length > 0 && (
                                        <>
                                            <RecentSearchHeader>
                                                <span>Recente</span>
                                                <button onClick={clearRecentSearches}>Limpar tudo</button>
                                            </RecentSearchHeader>
                                            {recentSearches.map((user) => (
                                                <SearchResultItem key={user._id} onMouseDown={() => handleResultClick(user)}>
                                                    <img src={`${ENDPOINT}${user.avatar}`} alt={user.username} />
                                                    <span>{user.username}</span>
                                                </SearchResultItem>
                                            ))}
                                        </>
                                    )
                                )}
                            </SearchResultsDropdown>
                        )}
                    </SearchWrapper>
                )}
                <NavLinks>
          {loggedInUser ? (
            <>
              {/* --- 2. SUBSTITUA O TEXTO PELOS ÍCONES --- */}
              <Link to="/">
                <GoHome />
              </Link>
              <Link to="/novo-post" title="Criar novo post">
                <IoAddCircleOutline />
              </Link>
              <Link to="/stories/novo" title="Adicionar novo story">
                {/* Você pode usar o mesmo ícone ou escolher outro da biblioteca react-icons */}
                <MdOutlineWebStories />
              </Link>
              <Link to={`/perfil/${loggedInUser.username}`} title="Perfil">
                <CgProfile />
              </Link>
              <LogoutButton onClick={handleLogout} title="Sair">
                <FiLogOut />
              </LogoutButton>
            </>
          ) : (
            <>
              <Link to="/login">Entrar</Link>
              <Link to="/registrar">Cadastre-se</Link>
            </>
          )}
        </NavLinks>
      </NavContainer>
    </NavWrapper>
  );
};

export default Navbar;