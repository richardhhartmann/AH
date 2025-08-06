import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, reset } from '../features/auth/authSlice';
import { fetchChats, updateChatStateFromSocket } from '../features/chat/chatSlice';
import styled from 'styled-components';
import api, { API_URL } from '../api/axios';
import io from 'socket.io-client';

// Ícones
import logoImage from '../assets/images/logo.jpg';
import { IoAddCircleOutline, IoAddCircle } from "react-icons/io5";
import { CgProfile } from "react-icons/cg";
import { FiLogOut } from "react-icons/fi";
import { BiWorld } from "react-icons/bi";
import { PiChats } from "react-icons/pi";
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

const NavIconWrapper = styled.span`
  position: relative;
  background-color: ${({ isSelected, disableEffect }) =>
    disableEffect ? 'transparent' :
    isSelected ? 'rgb(254, 121, 13)' : 'rgb(255, 240, 233)'};
  border-radius: 50%;
  padding: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease, color 0.3s ease;

  svg {
    color: ${({ isSelected, disableEffect }) =>
      disableEffect ? 'black' :
      isSelected ? 'white' : 'black'};
    transition: color 0.3s ease;
    font-size: 24px;
  }
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

const UnreadCountBadge = styled(NotificationBadge)`
  background-color: rgb(254, 121, 13);
`;

const NotificationsDropdown = styled.div`
  position: absolute;
  top: 150%;
  right: 0;
  width: 380px;
  background-color: #fff;
  border: 1px solid #dbdbdb;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  z-index: 20;
  max-height: 400px;
  overflow-y: auto;
`;

const NotificationItem = styled(Link)`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  font-size: 0.9rem;
  text-decoration: none;
  color: #262626;
  
  &:hover {
    background-color: #fafafa;
  }

  img {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    margin-right: 12px;
  }
`;

// --- Hook customizado ---
const useOnClickOutside = (ref, handler) => {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) return;
      handler(event);
    };
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
};

// --- Componente Principal ---
const Navbar = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation();
    
    const { user: loggedInUser } = useSelector((state) => state.auth);
    const { totalUnreadCount } = useSelector((state) => state.chat);

    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isFocused, setIsFocused] = useState(false);
    const [recentSearches, setRecentSearches] = useState(() => JSON.parse(localStorage.getItem('recentSearches')) || []);
    const [notifications, setNotifications] = useState([]);
    const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef();
    
    useOnClickOutside(dropdownRef, () => setIsDropdownOpen(false));

    useEffect(() => {
        if (!loggedInUser) return;

        dispatch(fetchChats());
        
        const fetchNotifications = async () => {
            try {
                const { data } = await api.get('/notifications');
                setNotifications(data);
                setUnreadNotificationCount(data.filter(n => !n.read).length);
            } catch (error) { console.error("Erro ao buscar notificações", error); }
        };
        fetchNotifications();
        
        const socket = io(process.env.REACT_APP_API_URL);
        socket.emit('setup', loggedInUser);
        
        socket.on('newNotification', (newNotification) => {
            setNotifications(prev => [newNotification, ...prev]);
            setUnreadNotificationCount(prev => prev + 1);
        });

        socket.on('messageReceived', (newMessage) => {
            dispatch(updateChatStateFromSocket({ ...newMessage, meta: { arg: { userId: loggedInUser._id } } }));
        });

        return () => { socket.disconnect(); };
    }, [loggedInUser, dispatch]);

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

    const handleBellClick = async () => {
        setIsDropdownOpen(prev => !prev);
        if (!isDropdownOpen && unreadNotificationCount > 0) {
            try {
                await api.put('/notifications/read');
                setUnreadNotificationCount(0);
            } catch (error) {
                console.error("Erro ao marcar notificações como lidas", error);
            }
        }
    };
    
    const getNotificationLink = (notification) => {
        if (!notification) return '/';
        switch(notification.type) {
            case 'like':
            case 'comment':
                return `/post/${notification.post?._id}`;
            case 'follow':
                return `/perfil/${notification.sender.username}`;
            default:
                return '/';
        }
    };

    const getNotificationText = (notification) => {
        if (!notification) return '';
        switch(notification.type) {
            case 'like':
                return 'curtiu sua publicação.';
            case 'comment':
                return 'comentou na sua publicação.';
            case 'follow':
                return 'começou a seguir você.';
            default:
                return '';
        }
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
                            {/* Ícone de Feed */}
                            <Link to="/" title="Feed">
                                <NavIconWrapper isSelected={location.pathname === '/'}>
                                    <BiWorld />
                                </NavIconWrapper>
                            </Link>

                            {/* Ícone de Mensagens */}
                            <Link to="/chat" title="Mensagens Diretas">
                                <NavIconWrapper isSelected={location.pathname === '/chat'}>
                                    <PiChats />
                                    {totalUnreadCount > 0 && <UnreadCountBadge>{totalUnreadCount}</UnreadCountBadge>}
                                </NavIconWrapper>
                            </Link>
                            
                            {/* Ícone de Criar (ALTERADO) */}
                            <Link to="/criar" title="Criar">
                                <NavIconWrapper isSelected={location.pathname === '/criar' || location.pathname === '/novo-post' || location.pathname === '/stories/novo'}>
                                    {location.pathname === '/criar' || location.pathname === '/novo-post' || location.pathname === '/stories/novo' ? <IoAddCircle /> : <IoAddCircleOutline />}
                                </NavIconWrapper>
                            </Link>

                            {/* Ícone de Notificações (ALTERADO) */}
                            <div title="Notificações" ref={dropdownRef} onClick={handleBellClick} style={{cursor: 'pointer'}}>
                                <NavIconWrapper isSelected={false} disableEffect>
                                  <FaRegBell />
                                  {unreadNotificationCount > 0 && !isDropdownOpen && <NotificationBadge>{unreadNotificationCount}</NotificationBadge>}
                                </NavIconWrapper>
                                {isDropdownOpen && (
                                    <NotificationsDropdown>
                                        {notifications.length > 0 ? notifications.map(notif => (
                                            <NotificationItem 
                                                key={notif._id} 
                                                to={getNotificationLink(notif)}
                                                onClick={() => setIsDropdownOpen(false)}
                                            >
                                                <img src={notif.sender.avatar.startsWith('http') ? notif.sender.avatar : `${API_URL}${notif.sender.avatar}`} alt={notif.sender.username} />
                                                <p>
                                                    <strong>{notif.sender.username}</strong>
                                                    {' '}{getNotificationText(notif)}
                                                </p>
                                            </NotificationItem>
                                        )) : <p style={{padding: '16px', textAlign: 'center', color: '#8e8e8e'}}>Nenhuma notificação.</p>}
                                    </NotificationsDropdown>
                                )}
                            </div>

                            {/* Ícone de Perfil (ALTERADO) */}
                            <Link to={`/perfil/${loggedInUser.username}`} title="Perfil">
                                <NavIconWrapper isSelected={location.pathname === `/perfil/${loggedInUser.username}`}>
                                    <CgProfile />
                                </NavIconWrapper>
                            </Link>

                            {/* Ícone de Sair (ALTERADO) */}
                            <LogoutButton onClick={handleLogout} title="Sair">
                                <NavIconWrapper>
                                    <FiLogOut />
                                </NavIconWrapper>
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