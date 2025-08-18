import { configureStore } from '@reduxjs/toolkit';
import postReducer from '../features/posts/postSlice'; 
import authReducer from '../features/auth/authSlice';
import chatReducer from '../features/chat/chatSlice'; 
import uiReducer from '../features/ui/uiSlice';

export const store = configureStore({
  reducer: {
    posts: postReducer,
    auth: authReducer,
    chat: chatReducer,
    ui: uiReducer,
  },
});