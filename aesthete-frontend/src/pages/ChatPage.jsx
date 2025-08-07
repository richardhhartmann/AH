import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation, Link, useParams } from 'react-router-dom';
import styled from 'styled-components';
import api, { API_URL } from '../api/axios';
import io from 'socket.io-client';
import { FiCheck, FiSend } from "react-icons/fi";
import { FaMicrophone } from 'react-icons/fa';
import { IoArrowBack } from "react-icons/io5";
import { fetchChats, markChatAsReadInState, updateChatStateFromSocket } from '../features/chat/chatSlice';
import AudioPlayer from '../components/AudioPlayer';

// --- Styled Components ---
const ChatContainer = styled.div`
  display: flex;
  height: calc(100vh - 61px); /* Subtrai a altura da Navbar */
  max-width: 935px;
  margin: 0 auto;
  border: 1px solid #dbdbdb;
  background-color: #fff;
  
  @media (max-width: 768px) {
    border: none;
    margin: 0;
    height: calc(100vh - 60px - 60px); /* Subtrai Navbar e MobileFooter */
  }
`;

const ChatList = styled.div`
  width: 35%;
  border-right: 1px solid #dbdbdb;
  overflow-y: auto;
  @media (max-width: 768px) {
    width: 100%;
    border-right: none;
    display: ${props => props.chatSelected ? 'none' : 'block'};
  }
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
  height: 100%; /* Garante que o componente ocupe toda a altura do container pai */
  min-height: 0; /* Hack de flexbox para garantir que o filho com overflow funcione corretamente */

  @media (max-width: 768px) {
    width: 100%;
    display: ${props => props.chatSelected ? 'flex' : 'none'};
  }
`;

const ChatWindowHeader = styled.div`
  padding: 10px 15px;
  border-bottom: 1px solid #dbdbdb;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 10px;

  /* MODIFICAÇÃO PARA MOBILE */
  @media (max-width: 768px) {
    position: sticky;
    top: 0; /* Colado no topo da área de rolagem */
    background-color: #fff; /* Fundo para não ficar transparente */
    z-index: 2; /* Garante que fique sobre a lista de mensagens */
  }
`;

const BackButton = styled.button`
  display: none; // Escondido no desktop
  @media (max-width: 768px) {
    display: flex;
    background: none;
    border: none;
    font-size: 1.8rem;
    cursor: pointer;
    padding: 0;
  }
`;

const HeaderAvatar = styled.img`
  /* MODIFICAÇÃO: AGORA APARECE EM TODAS AS TELAS */
  display: block;
  width: 40px;
  height: 40px;
  border-radius: 50%;
`;

const MessageList = styled.div`
  flex: 1; /* Faz o componente ocupar todo o espaço vertical disponível */
  padding: 20px;
  overflow-y: auto; /* Adiciona a barra de rolagem APENAS a este componente */
  display: flex;
  flex-direction: column;
`;

const MessageBubble = styled.div`
  max-width: 70%;
  padding: 10px 15px;
  border-radius: 20px;
  margin-bottom: 10px;
  align-self: ${props => props.isMe ? 'flex-end' : 'flex-start'};
  background-color: ${props => props.isMe ? 'rgb(254, 121, 13)' : '#efefef'};
  color: ${props => props.isMe ? 'white' : 'black'};
`;

const MessageForm = styled.form`
  display: flex;
  align-items: center;
  padding: 10px;
  border-top: 1px solid #dbdbdb;
  input {
    flex-grow: 1;
    border: 1px solid #dbdbdb;
    border-radius: 20px;
    padding: 10px 15px;
    outline: none;
    margin-right: 10px;
  }
`;

const MicButton = styled.button`
  background-color: ${props => props.isRecording ? 'red' : 'rgb(254, 121, 13)'};
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  font-size: 1.2rem;
  transition: background-color 0.2s;
`;

const SendButton = styled(MicButton)``;

const Placeholder = styled.div`
    display: flex;
    justify-content: center;   // horizontal
    align-items: center;       // vertical
    height: 100vh;             // altura da tela inteira
    width: 100%;               // largura total
    color: #8e8e8e;
    @media (max-width: 768px) {
        display: none;
    }
`;

// --- Configuração ---
const ENDPOINT = process.env.REACT_APP_API_URL;
let typingTimeout;

// --- Componente ---
const ChatPage = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    const { chatId } = useParams();

    const { user: loggedInUser } = useSelector((state) => state.auth);
    const { chats } = useSelector((state) => state.chat);

    const [socket, setSocket] = useState(null);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [typingChats, setTypingChats] = useState([]);
    const [isRecording, setIsRecording] = useState(false);
    
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const streamRef = useRef(null);
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
        if (!loggedInUser) return;

        const newSocket = io(ENDPOINT);
        setSocket(newSocket);
        
        newSocket.emit('setup', loggedInUser);

        const onlineUsersListener = (users) => setOnlineUsers(users);
        const messageListener = (newMessageReceived) => {
            if (selectedChatRef.current?._id === newMessageReceived.chat._id) {
                setMessages(prev => [...prev, newMessageReceived]);
            }
            dispatch(updateChatStateFromSocket({ newMessage: newMessageReceived, loggedInUserId: loggedInUser._id }));
        };
        const typingListener = (chatId) => setTypingChats(prev => [...new Set([...prev, chatId])]);
        const stopTypingListener = (chatId) => setTypingChats(prev => prev.filter(id => id !== chatId));

        newSocket.on('onlineUsers', onlineUsersListener);
        newSocket.on('messageReceived', messageListener);
        newSocket.on('typing', typingListener);
        newSocket.on('stopTyping', stopTypingListener);

        return () => {
            newSocket.disconnect();
        };
    }, [loggedInUser, dispatch]);

    useEffect(() => {
        // Prioriza o ID da URL. Se não houver, tenta o do state.
        const idToSelect = chatId || location.state?.chatId;

        if (idToSelect && chats.length > 0) {
            const chatToSelect = chats.find(c => c._id === idToSelect);
            if (chatToSelect) {
                handleSelectChat(chatToSelect);
            }
        }
    }, [chats, location.state, chatId, handleSelectChat]);
    
    useEffect(() => {
        if (!selectedChat || !socket) return;
        
        const fetchMessages = async () => {
            try {
                const { data } = await api.get(`/chats/${selectedChat._id}/messages`);
                setMessages(data);
                socket.emit('joinChat', selectedChat._id);
            } catch (error) { 
                console.error("Erro ao buscar mensagens", error); 
            }
        };
        fetchMessages();
    }, [selectedChat, socket]);

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
        if (!socket || !newMessage.trim() || !selectedChat) return;
        
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
        dispatch(updateChatStateFromSocket({ newMessage: tempMessage, loggedInUserId: loggedInUser._id }));
    };

    const getOtherUser = (chat) => {
        if (!chat?.participants) return null;
        return chat.participants.find(p => p._id !== loggedInUser._id);
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];
            
            mediaRecorder.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };
            
            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const duration = await getAudioDuration(audioBlob);
                sendAudio(audioBlob, duration);
                streamRef.current.getTracks().forEach(track => track.stop());
            };
            
            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Erro ao acessar o microfone:", err);
            alert("É necessário permitir o acesso ao microfone para enviar áudios.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.stop();
        }
        setIsRecording(false);
    };

    const handleMicClick = () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };
    
    const getAudioDuration = (file) => new Promise(resolve => {
        const audio = document.createElement('audio');
        audio.src = URL.createObjectURL(file);
        audio.onloadedmetadata = () => {
            resolve(audio.duration);
        };
    });

    const sendAudio = async (audioBlob, duration) => {
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.webm');
        formData.append('chatId', selectedChat._id);
        formData.append('duration', duration);
        
        try {
            const { data: newAudioMessage } = await api.post('/chats/upload-audio', formData);
            setMessages(prev => [...prev, newAudioMessage]);
            dispatch(updateChatStateFromSocket({ newMessage: newAudioMessage, loggedInUserId: loggedInUser._id }));
        } catch (error) {
            console.error("Erro ao enviar áudio:", error);
        }
    };

    const formatTime = (timeInSeconds) => {
        if (!timeInSeconds) return "0:00";
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = Math.floor(timeInSeconds % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <ChatContainer>
            <ChatList chatSelected={!!selectedChat}>
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
                                        
                                        {chat.lastMessage ? (
                                            chat.lastMessage.contentType === 'audio' ? (
                                                <>
                                                    <FaMicrophone size={14} />
                                                    <span>Mensagem de voz ({formatTime(chat.lastMessage.audioDuration)})</span>
                                                </>
                                            ) : (
                                                chat.lastMessage.content
                                            )
                                        ) : (
                                            'Inicie a conversa'
                                        )}
                                    </LastMessage>
                                )}
                            </ChatInfo>
                            {chat.unreadCount > 0 && <UnreadBadge>{chat.unreadCount}</UnreadBadge>}
                        </ChatItem>
                    );
                })}
            </ChatList>
            
            <ChatWindow chatSelected={!!selectedChat}>
                {selectedChat ? (
                    <>
                        <ChatWindowHeader>
                            <BackButton onClick={() => setSelectedChat(null)}>
                                <IoArrowBack />
                            </BackButton>
                            {/* MODIFICAÇÃO: O Link agora envolve o avatar e o nome */}
                            <Link to={`/perfil/${getOtherUser(selectedChat).username}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'inherit' }}>
                                <HeaderAvatar src={getOtherUser(selectedChat).avatar?.startsWith('http') ? getOtherUser(selectedChat).avatar : `${API_URL}${getOtherUser(selectedChat).avatar}`} />
                                <span>{getOtherUser(selectedChat).username}</span>
                            </Link>
                        </ChatWindowHeader>
                        <MessageList>
                            {messages.map((msg, i) => (
                                <MessageBubble key={msg._id || i} isMe={msg.sender._id === loggedInUser._id}>
                                    {msg.contentType === 'audio' ? (
                                        <AudioPlayer 
                                            src={msg.content} 
                                            duration={msg.audioDuration}
                                            isMe={msg.sender._id === loggedInUser._id}
                                        />
                                    ) : (
                                        msg.content
                                    )}
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
                            {newMessage ? (
                                <SendButton type="submit" disabled={!newMessage.trim()}>
                                    <FiSend />
                                </SendButton>
                            ) : (
                                <MicButton
                                    type="button"
                                    onClick={handleMicClick}
                                    isRecording={isRecording}
                                >
                                    <FaMicrophone />
                                </MicButton>
                            )}
                        </MessageForm>
                    </>
                ) : ( <Placeholder>Selecione uma conversa para começar.</Placeholder> )}
            </ChatWindow>
        </ChatContainer>
    );
};

export default ChatPage;