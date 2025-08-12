import { configureStore } from '@reduxjs/toolkit';

// 1. IMPORTE O REDUCER DO SEU POSTSLICE
import postReducer from '../features/posts/postSlice'; 
import authReducer from '../features/auth/authSlice';
import chatReducer from '../features/chat/chatSlice'; 
// ... importe quaisquer outros reducers que você tenha

export const store = configureStore({
  reducer: {
    // 2. ADICIONE A LINHA ABAIXO PARA REGISTRAR A SEÇÃO 'POSTS'
    posts: postReducer,
    
    // Seus outros reducers existentes
    auth: authReducer,
    chat: chatReducer,
  },
});