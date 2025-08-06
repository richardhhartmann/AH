import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, reset } from '../features/auth/authSlice';
import styled from 'styled-components';
import api, { API_URL } from '../api/axios';
import io from 'socket.io-client';

// Ícones
import logoImage from '../assets/images/logo.jpg'; // Verifique se o nome do seu logo é 'logo.png' ou '.jpg'
import { IoAddCircleOutline } from "react-icons/io5";
import { CgProfile } from "react-icons/cg";
import { FiLogOut } from "react-icons/fi";
import { GoHome } from "react-icons/go";
import { FaRegBell } from "react-icons/fa";

// --- Styled Components ---

const NavWrapper = styled.nav`
  background-color: rgb(255, 240, 233);
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
  img {
    height: 35px;
    vertical-align: middle;
  }
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 22px;
  a, button {
    color: #262626;
    font-size: 1.6rem;
    display: flex;
    align-items: center;
  }
`;

const LogoutButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
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
  max-height: 300px;
  overflow-y: auto;
`;

const SearchResultItem = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;
  cursor: pointer;
  &:hover { background-color: #fafafa; }
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
    font-size: 0.9rem;
  }
`;

const NavIconWrapper = styled.div`
  position: relative;
  cursor: pointer;
`;

const NotificationBadge = styled.span`
  background-color: red;
  color: white;
  border-radius: 50%;
  padding: 1px 5px;
  font-size: 0.7rem;
  position: absolute;
  top: -5px;
  right: -5px;
  border: 1px solid rgb(255, 240, 233);
`;

// --- Componente Principal ---
const Navbar = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user: loggedInUser } = useSelector((state) => state.auth);

    // Estados da Busca
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isFocused, setIsFocused] = useState(false);
    const [recentSearches, setRecentSearches] = useState(() => JSON.parse(localStorage.getItem('recentSearches')) || []);
    
    // Estados das Notificações
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // Efeito para buscar e escutar notificações
    useEffect(() => {
        if (!loggedInUser) return;

        const socket = io(process.env.REACT_APP_API_URL);

        const fetchNotifications = async () => {
            try {
                const { data } = await api.get('/notifications');
                setNotifications(data);
                setUnreadCount(data.filter(n => !n.read).length);
            } catch (error) { console.error("Erro ao buscar notificações", error); }
        };
        fetchNotifications();
        
        socket.emit('setup', loggedInUser);
        socket.on('newNotification', (newNotification) => {
            setNotifications(prev => [newNotification, ...prev]);
            setUnreadCount(prev => prev + 1);
        });

        return () => { socket.disconnect(); };
    }, [loggedInUser]);

    // Efeito para a busca com debounce
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
    }, [query]);

    const handleLogout = () => {
        dispatch(logout());
        dispatch(reset());
        navigate('/login');
    };

    const addRecentSearch = (user) => {
        const newRecent = [user, ...recentSearches.filter(u => u._id !== user._id)].slice(0, 5);
        setRecentSearches(newRecent);
        localStorage.setItem('recentSearches', JSON.stringify(newRecent));
    };

    const clearRecentSearches = () => {
        setRecentSearches([]);
        localStorage.removeItem('recentSearches');
    };

    const handleResultClick = (user) => {
        addRecentSearch(user);
        setQuery('');
        setResults([]);
        setIsFocused(false);
        navigate(`/perfil/${user.username}`);
    };

    return (
        <NavWrapper>
            <NavContainer>
                <Logo to="/">
                    <img src={logoImage} alt="Aesthete Logo" />
                </Logo>
                {loggedInUser && (
                    <SearchWrapper>
                        <SearchInput
                            type="text"
                            placeholder="Buscar..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                        />
                        {isFocused && (
                            <SearchResultsDropdown>
                                {query.length >= 2 && results.length > 0 ? (
                                    results.map((user) => (
                                        <SearchResultItem key={user._id} onMouseDown={() => handleResultClick(user)}>
                                            <img src={user.avatar.startsWith('http') ? user.avatar : `${API_URL}${user.avatar}`} alt={user.username} />
                                            <span>{user.username}</span>
                                        </SearchResultItem>
                                    ))
                                ) : ( query.length === 0 && recentSearches.length > 0 && (
                                    <>
                                        <RecentSearchHeader>
                                            <span>Recente</span>
                                            <button onClick={clearRecentSearches}>Limpar tudo</button>
                                        </RecentSearchHeader>
                                        {recentSearches.map((user) => (
                                            <SearchResultItem key={user._id} onMouseDown={() => handleResultClick(user)}>
                                                <img src={user.avatar.startsWith('http') ? user.avatar : `${API_URL}${user.avatar}`} alt={user.username} />
                                                <span>{user.username}</span>
                                            </SearchResultItem>
                                        ))}
                                    </>
                                ))}
                            </SearchResultsDropdown>
                        )}
                    </SearchWrapper>
                )}
                <NavLinks>
                    {loggedInUser ? (
                        <>
                            <Link to="/" title="Feed"><GoHome /></Link>
                            <Link to="/criar" title="Criar"><IoAddCircleOutline /></Link>
                            <NavIconWrapper title="Notificações">
                                <FaRegBell />
                                {unreadCount > 0 && <NotificationBadge>{unreadCount}</NotificationBadge>}
                                {/* O Dropdown de notificações seria renderizado aqui */}
                            </NavIconWrapper>
                            <Link to={`/perfil/${loggedInUser.username}`} title="Perfil"><CgProfile /></Link>
                            <LogoutButton onClick={handleLogout} title="Sair"><FiLogOut /></LogoutButton>
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