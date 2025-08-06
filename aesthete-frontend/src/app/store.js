// Em src/app/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import chatReducer from '../features/chat/chatSlice'; // 1. Importe o novo redutor

export const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer, // 2. Adicione-o aqui
  },
});