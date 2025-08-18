import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isCreateModalOpen: false,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openCreateModal: (state) => {
      state.isCreateModalOpen = true;
    },
    closeCreateModal: (state) => {
      state.isCreateModalOpen = false;
    },
  },
});

export const { openCreateModal, closeCreateModal } = uiSlice.actions;
export default uiSlice.reducer;