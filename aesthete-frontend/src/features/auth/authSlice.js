import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios'; // Supondo que você use axios

const ENDPOINT = process.env.REACT_APP_API_URL;
const API_URL = `${ENDPOINT}/api/auth/`; // A URL da sua API de autenticação

const user = JSON.parse(localStorage.getItem('user'));

const initialState = {
    user: user ? user : null,
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: '',
};

// --- AÇÕES ASSÍNCRONAS (THUNKS) ---
export const register = createAsyncThunk(
    'auth/register',
    async (userData, thunkAPI) => {
        try {
            const response = await axios.post(API_URL + 'register', userData);
            if (response.data) {
                localStorage.setItem('user', JSON.stringify(response.data));
            }
            return response.data;
        } catch (error) {
            const message = (error.response?.data?.message) || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const login = createAsyncThunk('auth/login', async (userData, thunkAPI) => {
    try {
        const response = await axios.post(API_URL + 'login', userData);
        if (response.data) {
            localStorage.setItem('user', JSON.stringify(response.data));
        }
        return response.data;
    } catch (error) {
        const message = (error.response?.data?.message) || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

export const logout = createAsyncThunk('auth/logout', async () => {
    localStorage.removeItem('user');
});


// --- CRIAÇÃO DO SLICE ---

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        reset: (state) => {
            state.isLoading = false;
            state.isSuccess = false;
            state.isError = false;
            state.message = '';
        },
        // ▼▼▼ ALTERAÇÃO 1: ADICIONE ESTE REDUCER ▼▼▼
        setCredentials: (state, action) => {
            state.user = action.payload.user;
            // Mantém o localStorage sincronizado
            localStorage.setItem('user', JSON.stringify(action.payload.user));
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(register.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(register.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.user = action.payload;
            })
            .addCase(register.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
                state.user = null;
            })
            .addCase(login.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.user = action.payload;
            })
            .addCase(login.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
                state.user = null;
            })
            .addCase(logout.fulfilled, (state) => {
                state.user = null;
            });
    },
});

// --- EXPORTAÇÕES ---

// ▼▼▼ ALTERAÇÃO 2: EXPORTE A NOVA AÇÃO AQUI ▼▼▼
export const { reset, setCredentials } = authSlice.actions;

export default authSlice.reducer;