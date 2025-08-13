// src/features/posts/postSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import postService from './postService'; // Certifique-se de que o caminho está correto
import api from '../../api/axios';

// Thunk para o feed "Seguindo"
export const fetchFeedPosts = createAsyncThunk(
    'posts/fetchFeed',
    async ({ page, limit }, { rejectWithValue }) => {
        try {
            const { data } = await api.get(`/posts/feed?page=${page}&limit=${limit}`);
            return data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

// NOVO: Thunk para o feed "Explorar"
export const fetchExplorePosts = createAsyncThunk(
    'posts/fetchExplore',
    async ({ page, limit }, { rejectWithValue }) => {
        try {
            const { data } = await api.get(`/posts/explore?page=${page}&limit=${limit}`);
            return data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const deletePost = createAsyncThunk(
    'posts/deletePost',
    async (postId, { rejectWithValue }) => {
        try {
            await api.delete(`/posts/${postId}`);
            return { id: postId };
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

const initialState = {
    // Estado para o feed "Seguindo"
    feedPosts: [],
    feedPage: 1,
    feedHasMore: true,
    feedStatus: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    
    // NOVO: Estado separado para o feed "Explorar"
    explorePosts: [],
    explorePage: 1,
    exploreHasMore: true,
    exploreStatus: 'idle',

    error: null,
};

export const likePost = createAsyncThunk(
  'posts/like', // Nome da ação para o Redux DevTools
  async (postId, thunkAPI) => {
    try {
      // Pega o token do usuário do estado global
      const token = thunkAPI.getState().auth.user.token;
      // Chama a função do seu serviço que faz a requisição à API
      return await postService.likePost(postId, token);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const postSlice = createSlice({
    name: 'posts',
    initialState,
    reducers: {
        resetFeed: (state) => {
            state.feedPosts = [];
            state.feedPage = 1;
            state.feedHasMore = true;
            state.feedStatus = 'idle';
        },
        // NOVO: Reducer para resetar o estado do feed Explorar
        resetExplore: (state) => {
            state.explorePosts = [];
            state.explorePage = 1;
            state.exploreHasMore = true;
            state.exploreStatus = 'idle';
        }
    },
    extraReducers: (builder) => {
        builder
            // Casos para o feed "Seguindo"
            .addCase(fetchFeedPosts.pending, (state) => { state.feedStatus = 'loading'; })
            .addCase(fetchFeedPosts.fulfilled, (state, action) => {
                // Se for a primeira página, substitui. Senão, adiciona.
                if (action.meta.arg.page === 1) {
                    state.feedPosts = action.payload.posts;
                } else {
                    state.feedPosts.push(...action.payload.posts);
                }
                state.feedHasMore = state.feedPosts.length < action.payload.totalPosts;
                state.feedPage = action.payload.currentPage + 1;
                state.feedStatus = 'succeeded';
            })
            .addCase(fetchFeedPosts.rejected, (state, action) => {
                state.feedStatus = 'failed';
                state.error = action.payload;
            })

            // NOVOS: Casos para o feed "Explorar"
            .addCase(fetchExplorePosts.pending, (state) => { state.exploreStatus = 'loading'; })
            .addCase(fetchExplorePosts.fulfilled, (state, action) => {
                if (action.meta.arg.page === 1) {
                    state.explorePosts = action.payload.posts;
                } else {
                    state.explorePosts.push(...action.payload.posts);
                }
                state.exploreHasMore = state.explorePosts.length < action.payload.totalPosts;
                state.explorePage = action.payload.currentPage + 1;
                state.exploreStatus = 'succeeded';
            })
            .addCase(fetchExplorePosts.rejected, (state, action) => {
                state.exploreStatus = 'failed';
                state.error = action.payload;
            })

            // Caso para deletar o post de ambos os feeds, se existir
            .addCase(deletePost.fulfilled, (state, action) => {
                state.feedPosts = state.feedPosts.filter(p => p._id !== action.payload.id);
                state.explorePosts = state.explorePosts.filter(p => p._id !== action.payload.id);
            })
            
            .addCase(likePost.fulfilled, (state, action) => {
                // 1. Adicione uma verificação para garantir que o payload existe
                if (!action.payload) {
                    return; // Sai do redutor se a resposta da API for vazia
                }

                const updatedPost = action.payload;
                const postIndex = state.posts.findIndex(post => post._id === updatedPost._id);

                // 2. Verifique se o post foi encontrado no estado
                if (postIndex !== -1) {
                    // 3. A SOLUÇÃO: Use `|| []` para garantir que a propriedade seja sempre um array
                    state.posts[postIndex].likes = updatedPost.likes || [];
                    state.posts[postIndex].comments = updatedPost.comments || []; // É uma boa prática fazer para todas as listas
                }
                });
    },
});

export const { resetFeed, resetExplore } = postSlice.actions;
export default postSlice.reducer;