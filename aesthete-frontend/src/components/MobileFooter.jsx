import React from 'react';
import styled from 'styled-components';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { API_URL } from '../api/axios';

// Ícones
import { GoHome, GoHomeFill } from 'react-icons/go';
import { IoSearchOutline, IoSearch } from 'react-icons/io5';
import { IoAddCircleOutline, IoAddCircle } from "react-icons/io5";
import { FaRegBell, FaBell } from "react-icons/fa";
import { CgProfile } from "react-icons/cg";

const FooterWrapper = styled.footer`
  display: none; // Escondido no desktop
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: rgb(255, 240, 233);
  border-top: 1px solid #dbdbdb;
  z-index: 100;

  @media (max-width: 768px) {
    display: flex;
  }
`;

const NavLinksContainer = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 100%;
  height: 60px;
`;

const NavLink = styled(Link)`
  color: #262626;
  font-size: 1.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ProfileIconWrapper = styled.div`
  img {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    border: ${props => props.isActive ? '2px solid #262626' : 'none'};
  }
`;

const MobileFooter = () => {
    const location = useLocation();
    const { user: loggedInUser } = useSelector((state) => state.auth);

    if (!loggedInUser) return null; // Não mostra o rodapé se não estiver logado

    return (
        <FooterWrapper>
            <NavLinksContainer>
                <NavLink to="/" title="Feed">
                    {location.pathname === '/' ? <GoHomeFill /> : <GoHome />}
                </NavLink>
                <NavLink to="/pesquisar" title="Pesquisar">
                    {location.pathname === '/pesquisar' ? <IoSearch /> : <IoSearchOutline />}
                </NavLink>
                <NavLink to="/criar" title="Criar">
                    {location.pathname.startsWith('/criar') || location.pathname.startsWith('/novo') ? <IoAddCircle /> : <IoAddCircleOutline />}
                </NavLink>
                <NavLink to="/notificacoes" title="Notificações">
                    {location.pathname === '/notificacoes' ? <FaBell /> : <FaRegBell />}
                </NavLink>
                <NavLink to={`/perfil/${loggedInUser.username}`} title="Perfil">
                    <ProfileIconWrapper isActive={location.pathname === `/perfil/${loggedInUser.username}`}>
                        <img src={loggedInUser.avatar.startsWith('http') ? loggedInUser.avatar : `${API_URL}${loggedInUser.avatar}`} alt="Perfil"/>
                    </ProfileIconWrapper>
                </NavLink>
            </NavLinksContainer>
        </FooterWrapper>
    );
};

export default MobileFooter;