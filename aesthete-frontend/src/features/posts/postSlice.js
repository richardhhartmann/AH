import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios'; // Sua instância do Axios

export const fetchFeedPosts = createAsyncThunk(
    'posts/fetchFeed',
    async (_, { getState, rejectWithValue }) => {
        try {
            const { auth: { userToken } } = getState();
            const config = { headers: { Authorization: `Bearer ${userToken}` } };
            const { data } = await api.get('/posts/feed', config);
            return data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

const postSlice = createSlice({
    name: 'posts',
    initialState: {
        feedPosts: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchFeedPosts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchFeedPosts.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.feedPosts = payload;
            })
            .addCase(fetchFeedPosts.rejected, (state, { payload }) => {
                state.loading = false;
                state.error = payload;
            });
    },
});

export default postSlice.reducer;