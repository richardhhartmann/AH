// src/features/posts/postSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
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
            });
    },
});

export const { resetFeed, resetExplore } = postSlice.actions;
export default postSlice.reducer;