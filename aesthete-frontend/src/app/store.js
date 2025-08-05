import { configureStore } from '@reduxjs/toolkit';
// Importe seus "slices" aqui. Por enquanto, teremos apenas o de autenticação.
import authReducer from '../features/auth/authSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    // posts: postsReducer, // Exemplo futuro
  },
});