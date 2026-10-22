import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type AppTheme = 'parchment' | 'midnight';
export type ModalType = 'login' | 'signup' | 'newStory' | 'contributors' | 'versions' | 'deployGuide' | null;

interface UiState {
  theme: AppTheme;
  activeModal: ModalType;
  activeView: 'home' | 'storyViewer' | 'storyEditor';
  selectedStoryId: number | null;
}

const initialState: UiState = {
  theme: 'midnight',
  activeModal: null,
  activeView: 'home',
  selectedStoryId: null,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<AppTheme>) => {
      state.theme = action.payload;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'midnight' ? 'parchment' : 'midnight';
    },
    openModal: (state, action: PayloadAction<ModalType>) => {
      state.activeModal = action.payload;
    },
    closeModal: (state) => {
      state.activeModal = null;
    },
    navigateTo: (
      state,
      action: PayloadAction<{ view: 'home' | 'storyViewer' | 'storyEditor'; storyId?: number | null }>
    ) => {
      state.activeView = action.payload.view;
      if (action.payload.storyId !== undefined) {
        state.selectedStoryId = action.payload.storyId;
      }
    },
  },
});

export const { setTheme, toggleTheme, openModal, closeModal, navigateTo } = uiSlice.actions;
export default uiSlice.reducer;
