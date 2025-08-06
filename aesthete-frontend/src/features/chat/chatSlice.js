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
        // Reducer para atualizar o estado quando uma mensagem chega via socket
        updateChatStateFromSocket: (state, action) => {
            const newMessage = action.payload;
            let totalUnread = 0;
            let chatExists = false;

            const updatedChats = state.chats.map(chat => {
                if (chat._id === newMessage.chat._id) {
                    chatExists = true;
                    // Incrementa o contador de não lidas apenas se a mensagem não for minha
                    const newUnreadCount = (chat.unreadCount || 0) + (newMessage.sender._id !== action.meta.arg.userId ? 1 : 0);
                    return { ...chat, lastMessage: newMessage, unreadCount: newUnreadCount };
                }
                return chat;
            });
            
            // Se o chat for novo e não estiver na lista, buscamos tudo de novo
            if (!chatExists) {
                // Esta é uma simplificação. Uma app mais complexa adicionaria o novo chat.
                // Por agora, vamos manter assim.
            }

            // Recalcula o total de não lidas
            updatedChats.forEach(chat => {
                totalUnread += chat.unreadCount || 0;
            });

            state.chats = updatedChats.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
            state.totalUnreadCount = totalUnread;
        },
        // Reducer para zerar a contagem de um chat específico
        markChatAsReadInState: (state, action) => {
            const chatId = action.payload;
            let totalUnread = 0;
            state.chats = state.chats.map(chat => {
                if (chat._id === chatId) {
                    return { ...chat, unreadCount: 0 };
                }
                return chat;
            });

            state.chats.forEach(chat => {
                totalUnread += chat.unreadCount || 0;
            });
            state.totalUnreadCount = totalUnread;
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
                // Calcula o total de mensagens não lidas
                state.totalUnreadCount = action.payload.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0);
            })
            .addCase(fetchChats.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            });
    },
});

export const { updateChatStateFromSocket, markChatAsReadInState } = chatSlice.actions;

export default chatSlice.reducer;