import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, reset } from '../features/auth/authSlice';
import { fetchChats, updateChatStateFromSocket } from '../features/chat/chatSlice';
import styled, { css } from 'styled-components';
import api, { API_URL } from '../api/axios';
import io from 'socket.io-client';

// Ícones
import logoImage from '../assets/images/logo.jpg';
import { IoAddCircleOutline, IoAddCircle, IoSearch, IoArrowBack } from "react-icons/io5";
import { CgProfile } from "react-icons/cg";
import { FiLogOut, FiSend } from "react-icons/fi";
import { GoHome, GoHomeFill } from "react-icons/go";
import { RiSendPlaneFill } from "react-icons/ri";
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
    position: relative;
  }
`;

const LogoutButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  @media (max-width: 768px) {
    display: none; // Esconde o botão de logout no mobile (geralmente fica em um menu)
  }
`;

const DesktopNavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 22px;

  @media (max-width: 768px) {
    display: none; // Esconde os ícones de navegação principais no mobile
  }
`;

const SearchWrapper = styled.div`
  position: relative;
  width: 250px;
  @media (max-width: 768px) {
    display: none;
  }
`;

const MobileSearchButton = styled.button`
  display: none;
  @media (max-width: 768px) {
    display: flex;
    font-size: 1.6rem;
    background: none;
    border: none;
    cursor: pointer;
    color: #262626;
  }
`;

const MobileSearchOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 60px;
  background-color: rgb(255, 240, 233);
  display: flex;
  align-items: center;
  padding: 0 15px;
  z-index: 11;
  transform: translateY(-100%);
  transition: transform 0.3s ease-in-out;
  border-bottom: 1px solid #dbdbdb;

  ${props => props.isOpen && css`
    transform: translateY(0);
  `}
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

const UnreadCountBadge = styled(NotificationBadge)`
  background-color: rgb(254, 121, 13);
`;

const NotificationsDropdown = styled.div`
  position: absolute;
  top: 150%;
  right: -20px;
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
  &:hover { background-color: #fafafa; }
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
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
    const [recentSearches, setRecentSearches] = useState(() => JSON.parse(localStorage.getItem('recentSearches')) || []);
    const [notifications, setNotifications] = useState([]);
    const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef();
    
    useOnClickOutside(dropdownRef, () => setIsDropdownOpen(false));
    useOnClickOutside(useRef(null), () => setIsMobileSearchOpen(false));

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
            dispatch(updateChatStateFromSocket({ newMessage, loggedInUserId: loggedInUser._id }));
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
        setIsMobileSearchOpen(false);
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

    const SearchComponent = () => (
      <div style={{width: '100%', position: 'relative'}}>
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
      </div>
    );

    return (
        <NavWrapper>
            <NavContainer>
                <Logo to="/">
                    <img src={logoImage} alt="Aesthete Logo" />
                </Logo>
                
                <SearchWrapper>
                  {loggedInUser && <SearchComponent />}
                </SearchWrapper>

                <NavLinks>
                    {loggedInUser ? (
                        <>
                            <DesktopNavLinks>
                                <Link to="/" title="Feed">{location.pathname === '/' ? <GoHomeFill /> : <GoHome />}</Link>
                                
                                <NavIconWrapper title="Notificações" ref={dropdownRef}>
                                    <div onClick={handleBellClick}>
                                        <FaRegBell />
                                        {unreadNotificationCount > 0 && <NotificationBadge>{unreadNotificationCount}</NotificationBadge>}
                                    </div>
                                    {isDropdownOpen && (
                                        <NotificationsDropdown>
                                            {/* ... Dropdown de notificações ... */}
                                        </NotificationsDropdown>
                                    )}
                                </NavIconWrapper>
                                
                                <Link to={`/perfil/${loggedInUser.username}`} title="Meu Perfil">
                                    <CgProfile />
                                </Link>

                            </DesktopNavLinks>

                            <Link to="/chat" title="Mensagens Diretas">
                                <NavIconWrapper>
                                    {location.pathname === '/chat' ? <RiSendPlaneFill /> : <FiSend />}
                                    {totalUnreadCount > 0 && <UnreadCountBadge>{totalUnreadCount}</UnreadCountBadge>}
                                </NavIconWrapper>
                            </Link>

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
            
            <MobileSearchOverlay isOpen={isMobileSearchOpen}>
                <IoArrowBack onClick={() => setIsMobileSearchOpen(false)} style={{cursor: 'pointer', marginRight: '15px', fontSize: '1.6rem'}}/>
                <SearchComponent />
            </MobileSearchOverlay>
        </NavWrapper>
    );
};

export default Navbar;