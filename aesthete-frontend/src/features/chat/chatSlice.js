import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

const initialState = {
    chats: [],
    totalUnreadCount: 0,
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
};

export const fetchChats = createAsyncThunk('chat/fetchChats', async () => {
    const response = await api.get('/chats');
    return response.data;
});

export const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        addOrUpdateChat: (state, action) => {
            const newChat = action.payload;
            const existingChat = state.chats.find(chat => chat._id === newChat._id);

            // Se o chat não existe na lista, adiciona-o ao início.
            if (!existingChat) {
                state.chats.unshift(newChat);
            }
        },
        removeChatFromState: (state, action) => {
            const chatIdToRemove = action.payload;
            state.chats = state.chats.filter(chat => chat._id !== chatIdToRemove);
            state.totalUnreadCount = state.chats.filter(chat => chat.unreadCount > 0).length;
        },
        updateChatStateFromSocket: (state, action) => {
            const { newMessage, loggedInUserId } = action.payload;
            let chatExists = false;

            const updatedChats = state.chats.map(chat => {
                if (chat._id === newMessage.chat._id) {
                    chatExists = true;
                    const newUnreadCount = (chat.unreadCount || 0) + (newMessage.sender._id !== loggedInUserId ? 1 : 0);
                    return { ...chat, lastMessage: newMessage, unreadCount: newUnreadCount };
                }
                return chat;
            });
            
            if (chatExists) {
                // Se o chat já existe, move-o para o topo da lista
                const chatToMove = updatedChats.find(chat => chat._id === newMessage.chat._id);
                const otherChats = updatedChats.filter(chat => chat._id !== newMessage.chat._id);
                state.chats = [chatToMove, ...otherChats];
            } else {
                 // Se o chat é completamente novo (vindo de outro utilizador), adiciona-o
                 const newChatFromServer = {
                    ...newMessage.chat,
                    lastMessage: newMessage,
                    unreadCount: 1,
                 }
                 state.chats.unshift(newChatFromServer);
            }

            state.totalUnreadCount = state.chats.filter(chat => chat.unreadCount > 0).length;
        },
        markChatAsReadInState: (state, action) => {
            const chatId = action.payload;
            state.chats = state.chats.map(chat => {
                if (chat._id === chatId) {
                    return { ...chat, unreadCount: 0 };
                }
                return chat;
            });
            state.totalUnreadCount = state.chats.filter(chat => chat.unreadCount > 0).length;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchChats.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchChats.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.chats = action.payload;
                state.totalUnreadCount = action.payload.filter(chat => chat.unreadCount > 0).length;
            })
            .addCase(fetchChats.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            });
    },
});

export const { addOrUpdateChat, updateChatStateFromSocket, markChatAsReadInState, removeChatFromState } = chatSlice.actions;

export default chatSlice.reducer;