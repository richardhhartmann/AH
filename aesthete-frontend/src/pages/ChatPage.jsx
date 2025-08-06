import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation, Link } from 'react-router-dom';
import styled from 'styled-components';
import api, { API_URL } from '../api/axios';
import io from 'socket.io-client';
import { FiCheck } from "react-icons/fi";
import { fetchChats, markChatAsReadInState, updateChatStateFromSocket } from '../features/chat/chatSlice';

// --- Styled Components ---
const ChatContainer = styled.div`
  display: flex;
  height: calc(100vh - 90px);
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
  padding: 10px 15px;
  cursor: pointer;
  background-color: ${props => props.isActive ? '#efefef' : 'transparent'};
  position: relative;
  &:hover { background-color: #fafafa; }
`;

const AvatarWrapper = styled.div`
  position: relative;
  flex-shrink: 0;
`;

const Avatar = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 15px;
  border: ${props => props.hasStory ? '3px solid rgb(254, 121, 13)' : '3px solid transparent'};
  padding: 2px;
`;

const OnlineIndicator = styled.div`
  position: absolute;
  bottom: 5px;
  right: 15px;
  width: 12px;
  height: 12px;
  background-color: #2ecc71;
  border-radius: 50%;
  border: 2px solid white;
`;

const ChatInfo = styled.div`
  overflow: hidden;
  flex-grow: 1;
`;

const LastMessage = styled.p`
  font-size: 0.85rem;
  color: #8e8e8e;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  gap: 5px;
`;

const TypingIndicator = styled(LastMessage)`
  color: #0095f6;
  font-style: italic;
`;

const UnreadBadge = styled.div`
  background-color: rgb(254, 121, 13);
  color: white;
  font-size: 0.75rem;
  font-weight: bold;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
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
  background-color: ${props => props.isMe ? 'rgba(255, 142, 50, 1)' : '#efefef'};
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

// --- Configuração ---
const ENDPOINT = process.env.REACT_APP_API_URL;
let socket;
let typingTimeout;

// --- Componente ---
const ChatPage = () => {
    const dispatch = useDispatch();
    const location = useLocation();

    const { user: loggedInUser } = useSelector((state) => state.auth);
    const { chats } = useSelector((state) => state.chat);

    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [typingChats, setTypingChats] = useState([]);
    
    const messagesEndRef = useRef(null);
    const selectedChatRef = useRef(null);

    useEffect(() => {
        selectedChatRef.current = selectedChat;
    }, [selectedChat]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSelectChat = useCallback(async (chat) => {
        setSelectedChat(chat);
        if (chat.unreadCount > 0) {
            try {
                await api.put(`/chats/${chat._id}/read`);
                dispatch(markChatAsReadInState(chat._id));
            } catch (error) { 
                console.error("Erro ao marcar chat como lido", error); 
            }
        }
    }, [dispatch]);

    useEffect(() => {
        if (location.state?.chatId && chats.length > 0) {
            const chatToSelect = chats.find(c => c._id === location.state.chatId);
            if (chatToSelect) {
                handleSelectChat(chatToSelect);
            }
        }
    }, [chats, location.state, handleSelectChat]);
    
    useEffect(() => {
        if (!selectedChat) return;
        
        const fetchMessages = async () => {
            try {
                const { data } = await api.get(`/chats/${selectedChat._id}/messages`);
                setMessages(data);
                if(socket) socket.emit('joinChat', selectedChat._id);
            } catch (error) { 
                console.error("Erro ao buscar mensagens", error); 
            }
        };
        fetchMessages();
    }, [selectedChat]);

    const handleTyping = (e) => {
        setNewMessage(e.target.value);
        if (!socket || !selectedChat) return;
        socket.emit('typing', selectedChat._id);
        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => {
            socket.emit('stopTyping', selectedChat._id);
        }, 3000);
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedChat) return;
        
        socket.emit('stopTyping', selectedChat._id);
        
        const tempMessage = {
            sender: { _id: loggedInUser._id, username: loggedInUser.username, avatar: loggedInUser.avatar },
            content: newMessage,
            chat: selectedChat,
            _id: Date.now().toString()
        };
        
        socket.emit('newMessage', tempMessage);
        setMessages(prev => [...prev, tempMessage]);
        setNewMessage('');
        
        // Atualiza a lista de conversas no Redux
        dispatch(updateChatStateFromSocket({ ...tempMessage, meta: { arg: { userId: loggedInUser._id } } }));
    };

    const getOtherUser = (chat) => {
        if (!chat?.participants) return null;
        return chat.participants.find(p => p._id !== loggedInUser._id);
    };

    return (
        <ChatContainer>
            <ChatList>
                {chats.map(chat => {
                    const otherUser = getOtherUser(chat);
                    if (!otherUser) return null;
                    const isUserOnline = onlineUsers.includes(otherUser._id);
                    const isChatTyping = typingChats.includes(chat._id);

                    return (
                        <ChatItem key={chat._id} onClick={() => handleSelectChat(chat)} isActive={selectedChat?._id === chat._id}>
                            <AvatarWrapper>
                                <Avatar 
                                    src={otherUser.avatar?.startsWith('http') ? otherUser.avatar : `${API_URL}${otherUser.avatar}`} 
                                    alt={otherUser.username}
                                    hasStory={otherUser.hasActiveStory}
                                />
                                {isUserOnline && <OnlineIndicator />}
                            </AvatarWrapper>
                            <ChatInfo>
                                <strong>{otherUser.username}</strong>
                                {isChatTyping ? (
                                    <TypingIndicator>digitando...</TypingIndicator>
                                ) : (
                                    <LastMessage>
                                        {chat.lastMessage?.sender?._id === loggedInUser._id && (
                                            <FiCheck size={16} title="Enviado por você"/>
                                        )}
                                        {chat.lastMessage ? chat.lastMessage.content : 'Inicie a conversa'}
                                    </LastMessage>
                                )}
                            </ChatInfo>
                            {chat.unreadCount > 0 && <UnreadBadge>{chat.unreadCount}</UnreadBadge>}
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
                            onChange={handleTyping}
                        />
                    </MessageForm>
                </ChatWindow>
            ) : ( <Placeholder>Selecione uma conversa para começar.</Placeholder> )}
        </ChatContainer>
    );
};

export default ChatPage;