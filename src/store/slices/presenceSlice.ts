import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ActiveWriter } from '../../types';
import { apiFetch } from '../../services/api';

interface PresenceState {
  activeWriters: ActiveWriter[];
  isPolling: boolean;
}

const initialState: PresenceState = {
  activeWriters: [],
  isPolling: false,
};

// Poll active presence for current story
export const fetchStoryPresence = createAsyncThunk(
  'presence/fetchStoryPresence',
  async (storyId: number, { rejectWithValue }) => {
    try {
      return await apiFetch<ActiveWriter[]>(`/stories/${storyId}/presence`);
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

// Send editor heartbeat and cursor position
export const sendHeartbeat = createAsyncThunk(
  'presence/sendHeartbeat',
  async (payload: { storyId: number; cursorPosition?: number }, { rejectWithValue }) => {
    try {
      return await apiFetch<ActiveWriter[]>(`/stories/${payload.storyId}/presence`, {
        method: 'POST',
        body: JSON.stringify({ cursorPosition: payload.cursorPosition }),
      });
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const presenceSlice = createSlice({
  name: 'presence',
  initialState,
  reducers: {
    clearPresence: (state) => {
      state.activeWriters = [];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchStoryPresence.fulfilled, (state, action) => {
      state.activeWriters = action.payload;
    });
    builder.addCase(sendHeartbeat.fulfilled, (state, action) => {
      state.activeWriters = action.payload;
    });
  },
});

export const { clearPresence } = presenceSlice.actions;
export default presenceSlice.reducer;
