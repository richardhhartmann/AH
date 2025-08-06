import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation, Link } from 'react-router-dom';
import styled from 'styled-components';
import api, { API_URL } from '../api/axios';
import io from 'socket.io-client';
import { FiCheck, FiSend } from "react-icons/fi";
import { FaMicrophone } from 'react-icons/fa';
import { fetchChats, markChatAsReadInState, updateChatStateFromSocket } from '../features/chat/chatSlice';
import AudioPlayer from '../components/AudioPlayer';

// --- Styled Components ---

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
  
  &:disabled {
    background-color: #fbdac0;
    cursor: not-allowed;
  }
`;

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

const SendButton = styled.button`
  background-color: rgb(254, 121, 13);
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
  
  &:disabled {
    background-color: #fbdac0;
    cursor: not-allowed;
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
let typingTimeout;

// --- Componente ---
const ChatPage = () => {
    const dispatch = useDispatch();
    const location = useLocation();

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

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            
            let audioChunks = [];
            mediaRecorder.ondataavailable = (event) => {
                audioChunks.push(event.data);
            };
            
            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                sendAudio(audioBlob);
                stream.getTracks().forEach(track => track.stop()); // Para de usar o microfone
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
            mediaRecorderRef.current.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                
                const duration = await getAudioDuration(audioBlob);
                
                sendAudio(audioBlob, duration);
                
                streamRef.current.getTracks().forEach(track => track.stop());
                audioChunksRef.current = [];
            };
            mediaRecorderRef.current.stop();
        }
        setIsRecording(false);
    };

    const sendAudio = async (audioBlob, duration) => {
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.webm');
        formData.append('chatId', selectedChat._id);
        formData.append('duration', duration); // <-- Enviando a duração
        
        try {
            // A API agora retorna a mensagem completa, incluindo a duração correta
            const { data: newAudioMessage } = await api.post('/chats/upload-audio', formData);

            // Atualiza a UI local
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
        if (location.state?.chatId && chats.length > 0) {
            const chatToSelect = chats.find(c => c._id === location.state.chatId);
            if (chatToSelect) {
                handleSelectChat(chatToSelect);
            }
        }
    }, [chats, location.state, handleSelectChat]);
    
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
                                        
                                        {chat.lastMessage ? (
                                            chat.lastMessage.contentType === 'audio' ? (
                                                <>
                                                    <FaMicrophone size={14} />
                                                    {/* Usamos a função formatTime que você já deve ter */}
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
                </ChatWindow>
            ) : ( <Placeholder>Selecione uma conversa para começar.</Placeholder> )}
        </ChatContainer>
    );
};

export default ChatPage;