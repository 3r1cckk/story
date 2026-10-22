import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import storyReducer from './slices/storySlice';
import presenceReducer from './slices/presenceSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    stories: storyReducer,
    presence: presenceReducer,
    ui: uiReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
