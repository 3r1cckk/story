import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Story, Contributor, Comment, StoryVersion } from '../../types';
import { apiFetch } from '../../services/api';

interface StoryDetail extends Story {
  contributors: Contributor[];
  comments: Comment[];
  versions: StoryVersion[];
}

interface StoryState {
  items: Story[];
  currentStory: StoryDetail | null;
  filter: 'all' | 'mine' | 'collaborations';
  selectedGenre: string;
  searchQuery: string;
  loading: boolean;
  saving: boolean;
  error: string | null;
}

const initialState: StoryState = {
  items: [],
  currentStory: null,
  filter: 'all',
  selectedGenre: 'All',
  searchQuery: '',
  loading: false,
  saving: false,
  error: null,
};

// 1. Fetch stories
export const fetchStories = createAsyncThunk(
  'stories/fetchStories',
  async (params: { author_id?: number; genre?: string; search?: string } | void, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams();
      if (params?.author_id) query.append('author_id', String(params.author_id));
      if (params?.genre && params.genre !== 'All') query.append('genre', params.genre);
      if (params?.search) query.append('search', params.search);

      const url = `/stories${query.toString() ? `?${query.toString()}` : ''}`;
      return await apiFetch<Story[]>(url);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch stories');
    }
  }
);

// 2. Fetch single story
export const fetchStoryById = createAsyncThunk(
  'stories/fetchStoryById',
  async (id: number, { rejectWithValue }) => {
    try {
      return await apiFetch<StoryDetail>(`/stories/${id}`);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to load story');
    }
  }
);

// 3. Create story
export const createStory = createAsyncThunk(
  'stories/createStory',
  async (payload: { title: string; content: string; synopsis?: string; genre?: string }, { rejectWithValue }) => {
    try {
      const res = await apiFetch<{ message: string; story: Story }>('/stories', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return res.story;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to create story');
    }
  }
);

// 4. Update story
export const updateStory = createAsyncThunk(
  'stories/updateStory',
  async (
    payload: { id: number; title: string; content: string; synopsis?: string; genre?: string; summary?: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await apiFetch<{ message: string; story: Story }>(`/stories/${payload.id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      return res.story;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to update story');
    }
  }
);

// 5. Delete story
export const deleteStory = createAsyncThunk(
  'stories/deleteStory',
  async (id: number, { rejectWithValue }) => {
    try {
      await apiFetch(`/stories/${id}`, { method: 'DELETE' });
      return id;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to delete story');
    }
  }
);

// 6. Add contributor
export const addContributor = createAsyncThunk(
  'stories/addContributor',
  async (payload: { story_id: number; user_id: number; role?: string }, { rejectWithValue }) => {
    try {
      const res = await apiFetch<{ message: string; contributor: Contributor }>('/contributors', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return res.contributor;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to add contributor');
    }
  }
);

// 7. Remove contributor
export const removeContributor = createAsyncThunk(
  'stories/removeContributor',
  async (id: number, { rejectWithValue }) => {
    try {
      await apiFetch(`/contributors/${id}`, { method: 'DELETE' });
      return id;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to remove contributor');
    }
  }
);

// 8. Add comment
export const addComment = createAsyncThunk(
  'stories/addComment',
  async (payload: { story_id: number; content: string }, { rejectWithValue }) => {
    try {
      const res = await apiFetch<{ message: string; comment: Comment }>(`/stories/${payload.story_id}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content: payload.content }),
      });
      return res.comment;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to add comment');
    }
  }
);

// 9. Create snapshot version
export const createSnapshot = createAsyncThunk(
  'stories/createSnapshot',
  async (payload: { story_id: number; title: string; content: string; summary: string }, { rejectWithValue }) => {
    try {
      const res = await apiFetch<{ message: string; version: StoryVersion }>(`/stories/${payload.story_id}/versions`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return res.version;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to create snapshot');
    }
  }
);

export const storySlice = createSlice({
  name: 'stories',
  initialState,
  reducers: {
    setFilter: (state, action: PayloadAction<'all' | 'mine' | 'collaborations'>) => {
      state.filter = action.payload;
    },
    setSelectedGenre: (state, action: PayloadAction<string>) => {
      state.selectedGenre = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    clearCurrentStory: (state) => {
      state.currentStory = null;
    },
    updateLocalStoryContent: (state, action: PayloadAction<{ title?: string; content?: string }>) => {
      if (state.currentStory) {
        if (action.payload.title !== undefined) state.currentStory.title = action.payload.title;
        if (action.payload.content !== undefined) state.currentStory.content = action.payload.content;
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch stories
    builder.addCase(fetchStories.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchStories.fulfilled, (state, action) => {
      state.loading = false;
      state.items = action.payload;
    });
    builder.addCase(fetchStories.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch story by id
    builder.addCase(fetchStoryById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchStoryById.fulfilled, (state, action) => {
      state.loading = false;
      state.currentStory = action.payload;
    });
    builder.addCase(fetchStoryById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Create story
    builder.addCase(createStory.pending, (state) => {
      state.saving = true;
    });
    builder.addCase(createStory.fulfilled, (state, action) => {
      state.saving = false;
      state.items.unshift(action.payload);
    });
    builder.addCase(createStory.rejected, (state, action) => {
      state.saving = false;
      state.error = action.payload as string;
    });

    // Update story
    builder.addCase(updateStory.pending, (state) => {
      state.saving = true;
    });
    builder.addCase(updateStory.fulfilled, (state, action) => {
      state.saving = false;
      if (state.currentStory && state.currentStory.id === action.payload.id) {
        state.currentStory.title = action.payload.title;
        state.currentStory.content = action.payload.content;
        state.currentStory.synopsis = action.payload.synopsis;
        state.currentStory.genre = action.payload.genre;
        state.currentStory.updated_at = action.payload.updated_at;
      }
      const index = state.items.findIndex((s) => s.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...action.payload };
      }
    });
    builder.addCase(updateStory.rejected, (state, action) => {
      state.saving = false;
      state.error = action.payload as string;
    });

    // Delete story
    builder.addCase(deleteStory.fulfilled, (state, action) => {
      state.items = state.items.filter((s) => s.id !== action.payload);
      if (state.currentStory?.id === action.payload) {
        state.currentStory = null;
      }
    });

    // Add contributor
    builder.addCase(addContributor.fulfilled, (state, action) => {
      if (state.currentStory) {
        state.currentStory.contributors.push(action.payload);
      }
    });

    // Remove contributor
    builder.addCase(removeContributor.fulfilled, (state, action) => {
      if (state.currentStory) {
        state.currentStory.contributors = state.currentStory.contributors.filter(
          (c) => c.id !== action.payload
        );
      }
    });

    // Add comment
    builder.addCase(addComment.fulfilled, (state, action) => {
      if (state.currentStory) {
        state.currentStory.comments.push(action.payload);
      }
    });

    // Create snapshot
    builder.addCase(createSnapshot.fulfilled, (state, action) => {
      if (state.currentStory) {
        state.currentStory.versions.unshift(action.payload);
      }
    });
  },
});

export const {
  setFilter,
  setSelectedGenre,
  setSearchQuery,
  clearCurrentStory,
  updateLocalStoryContent,
} = storySlice.actions;

export default storySlice.reducer;
