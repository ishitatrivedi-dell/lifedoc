import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Types
export interface DiaryEntry {
    _id: string;
    userId: string;
    date: string;
    rawText?: string;
    summary: string;
    mood?: 'happy' | 'neutral' | 'stressed' | 'sad' | 'anxious' | 'energetic';
    tags?: string[];
    createdAt: string;
    updatedAt: string;
}

export interface MoodStat {
    _id: string;
    count: number;
}

interface DiaryState {
    entries: DiaryEntry[];
    currentEntry: DiaryEntry | null;
    stats: MoodStat[];
    loading: boolean;
    error: string | null;
    filter: {
        mood: string | null;
        tag: string | null;
    };
}

const initialState: DiaryState = {
    entries: [],
    currentEntry: null,
    stats: [],
    loading: false,
    error: null,
    filter: {
        mood: null,
        tag: null,
    }
};

const getAuthHeader = () => {
    const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || sessionStorage.getItem('token')) : null;
    return { Authorization: `Bearer ${token}` };
};

// Async thunks
export const fetchDiaryEntries = createAsyncThunk(
    'diary/fetchAll',
    async (userId: string, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/diary/user/${userId}`, {
                headers: getAuthHeader(),
            });
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch diary entries');
        }
    }
);

export const fetchDiaryEntriesByMood = createAsyncThunk(
    'diary/fetchByMood',
    async ({ userId, mood }: { userId: string; mood: string }, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/diary/user/${userId}/mood/${mood}`, {
                headers: getAuthHeader(),
            });
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch diary entries by mood');
        }
    }
);

export const fetchMoodStatistics = createAsyncThunk(
    'diary/fetchStats',
    async (userId: string, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/diary/user/${userId}/stats/mood`, {
                headers: getAuthHeader(),
            });
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch mood statistics');
        }
    }
);

export const getDiaryEntryById = createAsyncThunk(
    'diary/fetchOne',
    async (id: string, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/diary/${id}`, {
                headers: getAuthHeader(),
            });
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch diary entry');
        }
    }
);

export const createDiaryEntry = createAsyncThunk(
    'diary/create',
    async (data: { userId: string; date: string; rawText?: string; summary: string; mood?: string; tags?: string[] }, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/diary`, data, {
                headers: getAuthHeader(),
            });
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create diary entry');
        }
    }
);

export const updateDiaryEntry = createAsyncThunk(
    'diary/update',
    async ({ id, data }: { id: string; data: Partial<DiaryEntry> }, { rejectWithValue }) => {
        try {
            const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/diary/${id}`, data, {
                headers: getAuthHeader(),
            });
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update diary entry');
        }
    }
);

export const deleteDiaryEntry = createAsyncThunk(
    'diary/delete',
    async (id: string, { rejectWithValue }) => {
        try {
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/diary/${id}`, {
                headers: getAuthHeader(),
            });
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete diary entry');
        }
    }
);

// Slice
const diarySlice = createSlice({
    name: 'diary',
    initialState,
    reducers: {
        clearErrors: (state) => {
            state.error = null;
        },
        clearCurrentEntry: (state) => {
            state.currentEntry = null;
        },
        setFilter: (state, action) => {
            state.filter = { ...state.filter, ...action.payload };
        },
        resetFilter: (state) => {
            state.filter = { mood: null, tag: null };
        }
    },
    extraReducers: (builder) => {
        // Fetch All
        builder
            .addCase(fetchDiaryEntries.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDiaryEntries.fulfilled, (state, action) => {
                state.loading = false;
                state.entries = action.payload;
            })
            .addCase(fetchDiaryEntries.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Fetch By Mood
        builder
            .addCase(fetchDiaryEntriesByMood.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDiaryEntriesByMood.fulfilled, (state, action) => {
                state.loading = false;
                state.entries = action.payload;
            })
            .addCase(fetchDiaryEntriesByMood.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Fetch Stats
        builder
            .addCase(fetchMoodStatistics.fulfilled, (state, action) => {
                state.stats = action.payload;
            });

        // Get One
        builder
            .addCase(getDiaryEntryById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getDiaryEntryById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentEntry = action.payload;
            })
            .addCase(getDiaryEntryById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Create
        builder
            .addCase(createDiaryEntry.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createDiaryEntry.fulfilled, (state, action) => {
                state.loading = false;
                state.entries.unshift(action.payload);
                // Update stats locally if possible, or trigger refetch in component
            })
            .addCase(createDiaryEntry.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Update
        builder
            .addCase(updateDiaryEntry.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateDiaryEntry.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.entries.findIndex(e => e._id === action.payload._id);
                if (index !== -1) {
                    state.entries[index] = action.payload;
                }
                if (state.currentEntry?._id === action.payload._id) {
                    state.currentEntry = action.payload;
                }
            })
            .addCase(updateDiaryEntry.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Delete
        builder
            .addCase(deleteDiaryEntry.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteDiaryEntry.fulfilled, (state, action) => {
                state.loading = false;
                state.entries = state.entries.filter(e => e._id !== action.payload);
                if (state.currentEntry?._id === action.payload) {
                    state.currentEntry = null;
                }
            })
            .addCase(deleteDiaryEntry.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearErrors, clearCurrentEntry, setFilter, resetFilter } = diarySlice.actions;
export default diarySlice.reducer;
