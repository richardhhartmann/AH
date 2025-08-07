// src/pages/NotificationPage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import api, { API_URL } from '../api/axios';

// --- Styled Components para a Página ---

const PageContainer = styled.div`
  max-width: 600px;
  margin: 20px auto;
  padding: 0 15px;
  background-color: #fff;
  border: 1px solid #dbdbdb;
  border-radius: 8px;

  @media (max-width: 768px) {
    border: none;
    border-radius: 0;
    margin: 0;
  }
`;

const Header = styled.h1`
  font-size: 1.5rem;
  padding: 16px;
  border-bottom: 1px solid #dbdbdb;
`;

const NotificationList = styled.div`
  display: flex;
  flex-direction: column;
`;

const NotificationItemWrapper = styled(Link)`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  text-decoration: none;
  color: #262626;
  transition: background-color 0.2s ease-in-out;

  &:hover {
    background-color: #fafafa;
  }

  & + & {
    border-top: 1px solid #efefef;
  }
`;

const Avatar = styled.img`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  margin-right: 12px;
`;

const NotificationContent = styled.p`
  margin: 0;
  flex-grow: 1;
`;

const Timestamp = styled.span`
  font-size: 0.8rem;
  color: #8e8e8e;
  flex-shrink: 0;
  margin-left: 10px;
`;

const LoadingMessage = styled.p`
    text-align: center;
    padding: 20px;
    color: #8e8e8e;
`;

// --- Componente da Página de Notificações ---

const NotificationPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/notifications');
        setNotifications(data);
        setError(null);
      } catch (err) {
        console.error("Erro ao buscar notificações:", err);
        setError("Não foi possível carregar suas notificações. Tente novamente mais tarde.");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []); // O array vazio [] garante que o useEffect rode apenas uma vez

  // Funções auxiliares (reaproveitadas do Navbar)
  // Dica: No futuro, você pode mover estas funções para um arquivo de utilidades (utils.js) para não repetir código.
  const getNotificationLink = (notification) => {
    if (!notification) return '/';
    switch (notification.type) {
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
    switch (notification.type) {
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

  const formatTimestamp = (dateString) => {
    const date = new Date(dateString);
    // Lógica simples de formatação de data, pode ser melhorada com uma biblioteca como date-fns
    const diff = Math.floor((new Date() - date) / 1000);
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  }

  const renderContent = () => {
    if (loading) {
      return <LoadingMessage>Carregando notificações...</LoadingMessage>;
    }
    if (error) {
      return <LoadingMessage>{error}</LoadingMessage>;
    }
    if (notifications.length === 0) {
      return <LoadingMessage>Você não tem nenhuma notificação.</LoadingMessage>;
    }
    return (
      <NotificationList>
        {notifications.map(notif => (
          <NotificationItemWrapper key={notif._id} to={getNotificationLink(notif)}>
            <Avatar 
              src={notif.sender.avatar.startsWith('http') ? notif.sender.avatar : `${API_URL}${notif.sender.avatar}`} 
              alt={notif.sender.username} 
            />
            <NotificationContent>
              <strong>{notif.sender.username}</strong>
              {' '}{getNotificationText(notif)}
            </NotificationContent>
            <Timestamp>{formatTimestamp(notif.createdAt)}</Timestamp>
          </NotificationItemWrapper>
        ))}
      </NotificationList>
    );
  };
  
  return (
    <PageContainer>
      <Header>Notificações</Header>
      {renderContent()}
    </PageContainer>
  );
};

export default NotificationPage;