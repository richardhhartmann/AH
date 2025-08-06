import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, Link } from 'react-router-dom'; // <-- CORREÇÃO: 'Link' foi adicionado
import styled from 'styled-components';
import api, { API_URL } from '../api/axios'; // <-- CORREÇÃO: 'api' e 'API_URL' foram importados
import io from 'socket.io-client';

// --- Styled Components para o Layout ---

const ChatContainer = styled.div`
  display: flex;
  height: calc(100vh - 90px); /* Altura da tela menos a navbar e um pouco de padding */
  max-width: 935px;
  margin: 20px auto;
  border: 1px solid #dbdbdb;
  background-color: #fff;
`;

const ChatList = styled.div`
  width: 35%;
  border-right: 1px solid #dbdbdb;
  overflow-y: auto;
`;

const ChatItem = styled.div`
  display: flex;
  align-items: center;
  padding: 15px;
  cursor: pointer;
  background-color: ${props => props.isActive ? '#efefef' : 'transparent'};

  &:hover {
    background-color: #fafafa;
  }

  img {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    margin-right: 15px;
  }
`;

const ChatWindow = styled.div`
  width: 65%;
  display: flex;
  flex-direction: column;
`;

const ChatWindowHeader = styled.div`
  padding: 15px;
  border-bottom: 1px solid #dbdbdb;
  font-weight: bold;
`;

const MessageList = styled.div`
  flex-grow: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

const MessageBubble = styled.div`
  max-width: 70%;
  padding: 10px 15px;
  border-radius: 20px;
  margin-bottom: 10px;
  align-self: ${props => props.isMe ? 'flex-end' : 'flex-start'};
  background-color: ${props => props.isMe ? '#0095f6' : '#efefef'};
  color: ${props => props.isMe ? 'white' : 'black'};
`;

const MessageForm = styled.form`
  display: flex;
  padding: 10px;
  border-top: 1px solid #dbdbdb;

  input {
    flex-grow: 1;
    border: 1px solid #dbdbdb;
    border-radius: 20px;
    padding: 10px 15px;
    outline: none;
  }
`;

const Placeholder = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 65%;
    color: #8e8e8e;
`;

// --- Configuração do Socket.IO ---
const ENDPOINT = process.env.REACT_APP_API_URL;
let socket;

// --- Componente ---
const ChatPage = () => {
    const { user: loggedInUser } = useSelector((state) => state.auth);
    const location = useLocation();

    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    useEffect(() => {
        socket = io(ENDPOINT);
        socket.emit('setup', loggedInUser);

        const fetchChats = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${loggedInUser.token}` } };
                const { data } = await api.get('/chats', config);
                setChats(data);

                if (location.state?.chatId) {
                    const chatToSelect = data.find(c => c._id === location.state.chatId);
                    if (chatToSelect) setSelectedChat(chatToSelect);
                }
            } catch (error) { console.error("Erro ao buscar conversas", error); }
        };
        fetchChats();

        return () => { socket.disconnect(); };
    }, [loggedInUser, location.state]);

    useEffect(() => {
        if (!selectedChat) return;

        const fetchMessages = async () => {
            try {
                const { data } = await api.get(`/chats/${selectedChat._id}/messages`);
                setMessages(data);
                socket.emit('joinChat', selectedChat._id);
            } catch (error) { console.error("Erro ao buscar mensagens", error); }
        };
        fetchMessages();
    }, [selectedChat]);

    useEffect(() => {
        const messageListener = (newMessageReceived) => {
            if (selectedChat && selectedChat._id === newMessageReceived.chat._id) {
                setMessages(prevMessages => [...prevMessages, newMessageReceived]);
            }
        };
        socket.on('messageReceived', messageListener);
        return () => { socket.off('messageReceived', messageListener); };
    });

    const sendMessage = async (e) => {
        e.preventDefault();
        if (newMessage.trim()) {
            const tempMessage = {
                sender: loggedInUser,
                content: newMessage,
                chat: selectedChat,
                createdAt: new Date().toISOString()
            };
            socket.emit('newMessage', tempMessage);
            setMessages([...messages, tempMessage]);
            setNewMessage('');
        }
    };

    const getOtherUser = (chat) => {
        return chat.participants.find(p => p._id !== loggedInUser._id);
    };

    return (
        <ChatContainer>
            <ChatList>
                {chats.map(chat => {
                    const otherUser = getOtherUser(chat);

                    // --- AQUI ESTÁ A CORREÇÃO ---
                    // Se 'otherUser' não for encontrado, pulamos a renderização
                    // deste item para evitar o erro.
                    if (!otherUser) {
                        return null;
                    }

                    return (
                        <ChatItem key={chat._id} onClick={() => setSelectedChat(chat)} isActive={selectedChat?._id === chat._id}>
                            <img src={otherUser.avatar.startsWith('http') ? otherUser.avatar : `${API_URL}${otherUser.avatar}`} alt={otherUser.username} />
                            <span>{otherUser.username}</span>
                        </ChatItem>
                    );
                })}
            </ChatList>
            
            {selectedChat ? (
                <ChatWindow>
                    <ChatWindowHeader>
                        <Link to={`/perfil/${getOtherUser(selectedChat).username}`}>
                            {getOtherUser(selectedChat).username}
                        </Link>
                    </ChatWindowHeader>
                    <MessageList>
                        {messages.map((msg, i) => (
                            <MessageBubble key={msg._id || i} isMe={msg.sender._id === loggedInUser._id}>
                                {msg.content}
                            </MessageBubble>
                        ))}
                        <div ref={messagesEndRef} />
                    </MessageList>
                    <MessageForm onSubmit={sendMessage}>
                        <input
                            type="text"
                            placeholder="Digite uma mensagem..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                        />
                    </MessageForm>
                </ChatWindow>
            ) : (
                <Placeholder>Selecione uma conversa para começar.</Placeholder>
            )}
        </ChatContainer>
    );
};

export default ChatPage;