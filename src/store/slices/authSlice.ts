import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../types';
import { apiFetch, setInMemoryToken } from '../../services/api';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  initialized: false,
};

// Async thunk for user registration
export const registerUser = createAsyncThunk(
  'auth/register',
  async (credentials: { username: string; email: string; password: string }, { rejectWithValue }) => {
    try {
      const data = await apiFetch<{ message: string; accessToken: string; user: User }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      setInMemoryToken(data.accessToken);
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Registration failed');
    }
  }
);

// Async thunk for login
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const data = await apiFetch<{ message: string; accessToken: string; user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      setInMemoryToken(data.accessToken);
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Login failed');
    }
  }
);

// Async thunk to verify refresh token on app initialization
export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async (_, { rejectWithValue }) => {
    try {
      const data = await apiFetch<{ accessToken: string; user: User }>('/auth/refresh', {
        method: 'POST',
      });
      setInMemoryToken(data.accessToken);
      return data;
    } catch (err: any) {
      setInMemoryToken(null);
      return rejectWithValue('No active session');
    }
  }
);

// Async thunk for logout
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } finally {
      setInMemoryToken(null);
    }
  }
);

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
    setAccessToken: (state, action: PayloadAction<string | null>) => {
      state.accessToken = action.payload;
      state.isAuthenticated = !!action.payload;
      setInMemoryToken(action.payload);
    },
  },
  extraReducers: (builder) => {
    // Register
    builder.addCase(registerUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(registerUser.fulfilled, (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.error = null;
    });
    builder.addCase(registerUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Login
    builder.addCase(loginUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.error = null;
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Initialize Auth (silent refresh on reload)
    builder.addCase(initializeAuth.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(initializeAuth.fulfilled, (state, action) => {
      state.loading = false;
      state.initialized = true;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
    });
    builder.addCase(initializeAuth.rejected, (state) => {
      state.loading = false;
      state.initialized = true;
      state.isAuthenticated = false;
      state.user = null;
      state.accessToken = null;
    });

    // Logout
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.accessToken = null;
      state.loading = false;
    });
  },
});

export const { clearAuthError, setAccessToken } = authSlice.actions;
export default authSlice.reducer;
