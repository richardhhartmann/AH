import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import styled from 'styled-components';

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
    const location = useLocation(); // Para pegar o chatId vindo da página de perfil

    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    
    const messagesEndRef = useRef(null); // Referência para o final da lista de mensagens

    // Função para rolar para o final da lista de mensagens
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Efeito para rolar para o final sempre que novas mensagens chegarem
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Efeito para configurar o Socket.IO e buscar as conversas
    useEffect(() => {
        socket = io(ENDPOINT);
        socket.emit('setup', loggedInUser);

        const fetchChats = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${loggedInUser.token}` } };
                const { data } = await axios.get(`${ENDPOINT}/api/chats`, config);
                setChats(data);

                // Se viemos da página de perfil, seleciona o chat automaticamente
                if (location.state?.chatId) {
                    const chatToSelect = data.find(c => c._id === location.state.chatId);
                    if (chatToSelect) setSelectedChat(chatToSelect);
                }
            } catch (error) {
                console.error("Erro ao buscar conversas", error);
            }
        };
        fetchChats();

        return () => { socket.disconnect(); };
    }, [loggedInUser, location.state]);

    // Efeito para buscar as mensagens quando um chat é selecionado
    useEffect(() => {
        if (!selectedChat) return;

        const fetchMessages = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${loggedInUser.token}` } };
                const { data } = await axios.get(`${ENDPOINT}/api/chats/${selectedChat._id}/messages`, config);
                setMessages(data);
                socket.emit('joinChat', selectedChat._id);
            } catch (error) {
                console.error("Erro ao buscar mensagens", error);
            }
        };
        fetchMessages();
    }, [selectedChat, loggedInUser.token]);

    // Efeito para escutar novas mensagens em tempo real
    useEffect(() => {
        socket.on('messageReceived', (newMessageReceived) => {
            if (selectedChat && selectedChat._id === newMessageReceived.chat._id) {
                setMessages(prevMessages => [...prevMessages, newMessageReceived]);
            }
        });

        return () => { socket.off('messageReceived'); };
    });

    const sendMessage = async (e) => {
        e.preventDefault();
        if (newMessage.trim()) {
            try {
                const messageData = {
                    sender: loggedInUser,
                    content: newMessage,
                    chat: selectedChat,
                };
                
                // Atualização otimista: adiciona a mensagem à UI imediatamente
                setMessages([...messages, messageData]);
                setNewMessage('');

                // Envia a mensagem para o servidor via socket
                socket.emit('newMessage', messageData);
            } catch (error) {
                console.error("Erro ao enviar mensagem", error);
            }
        }
    };

    // Função auxiliar para pegar o nome e foto do outro usuário na conversa
    const getOtherUser = (chat) => {
        return chat.participants.find(p => p._id !== loggedInUser._id);
    };

    return (
        <ChatContainer>
            <ChatList>
                {chats.map(chat => {
                    const otherUser = getOtherUser(chat);
                    return (
                        <ChatItem key={chat._id} onClick={() => setSelectedChat(chat)} isActive={selectedChat?._id === chat._id}>
                            <img src={`${ENDPOINT}${otherUser.avatar}`} alt={otherUser.username} />
                            <span>{otherUser.username}</span>
                        </ChatItem>
                    );
                })}
            </ChatList>
            
            {selectedChat ? (
                <ChatWindow>
                    <ChatWindowHeader>{getOtherUser(selectedChat).username}</ChatWindowHeader>
                    <MessageList>
                        {messages.map((msg, i) => (
                            <MessageBubble key={i} isMe={msg.sender._id === loggedInUser._id}>
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
                <Placeholder>Selecione uma conversa para começar a conversar.</Placeholder>
            )}
        </ChatContainer>
    );
};

export default ChatPage;