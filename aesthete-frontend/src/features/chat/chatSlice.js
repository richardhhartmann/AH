import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

const initialState = {
    chats: [],
    totalUnreadCount: 0,
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
};

// Thunk para buscar as conversas
export const fetchChats = createAsyncThunk('chat/fetchChats', async () => {
    const response = await api.get('/chats');
    return response.data;
});

const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
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
                const chatToMove = updatedChats.find(chat => chat._id === newMessage.chat._id);
                const otherChats = updatedChats.filter(chat => chat._id !== newMessage.chat._id);
                state.chats = [chatToMove, ...otherChats];
            }

            // --- LÓGICA CORRIGIDA ---
            // Contamos quantos chats têm unreadCount > 0
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

            // --- LÓGICA CORRIGIDA ---
            // Recalculamos quantos chats têm unreadCount > 0
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
                
                // --- LÓGICA CORRIGIDA ---
                // Contamos quantos chats têm unreadCount > 0
                state.totalUnreadCount = action.payload.filter(chat => chat.unreadCount > 0).length;
            })
            .addCase(fetchChats.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            });
    },
});

export const { updateChatStateFromSocket, markChatAsReadInState } = chatSlice.actions;

export default chatSlice.reducer;