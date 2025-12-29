import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Types
export interface LabReport {
    _id: string;
    userId: string;
    reportDate: string;
    testType: string;
    parsedResults?: any; // mixed type
    fileUrl?: string;
    originalReport?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

interface LabReportsState {
    reports: LabReport[];
    currentReport: LabReport | null;
    loading: boolean;
    error: string | null;
}

const initialState: LabReportsState = {
    reports: [],
    currentReport: null,
    loading: false,
    error: null,
};

const getAuthHeader = () => {
    const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || sessionStorage.getItem('token')) : null;
    return { Authorization: `Bearer ${token}` };
};

// Async thunks
export const fetchLabReports = createAsyncThunk(
    'labReports/fetchAll',
    async (userId: string, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/lab-reports/user/${userId}`, {
                headers: getAuthHeader(),
            });
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch lab reports');
        }
    }
);

export const createLabReport = createAsyncThunk(
    'labReports/create',
    async (data: { reportDate: string; testType: string; parsedResults?: any; fileUrl?: string; notes?: string }, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/lab-reports`, data, {
                headers: getAuthHeader(),
            });
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create lab report');
        }
    }
);

export const analyzeLabReport = createAsyncThunk(
    'labReports/analyze',
    async (data: { image: string; notes?: string; reportDate?: string; testType?: string }, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/ai/analyze-lab-report`, data, {
                headers: getAuthHeader(),
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to analyze lab report');
        }
    }
);

export const deleteLabReport = createAsyncThunk(
    'labReports/delete',
    async (id: string, { rejectWithValue }) => {
        try {
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/lab-reports/${id}`, {
                headers: getAuthHeader(),
            });
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete lab report');
        }
    }
);

export const fetchLabReportById = createAsyncThunk(
    'labReports/fetchById',
    async (id: string, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/lab-reports/${id}`, {
                headers: getAuthHeader(),
            });
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch lab report');
        }
    }
);

// Slice
const labReportsSlice = createSlice({
    name: 'labReports',
    initialState,
    reducers: {
        clearErrors: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchLabReports.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchLabReports.fulfilled, (state, action) => {
                state.loading = false;
                state.reports = action.payload;
            })
            .addCase(fetchLabReports.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        builder
            .addCase(createLabReport.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createLabReport.fulfilled, (state, action) => {
                state.loading = false;
                state.reports.unshift(action.payload);
            })
            .addCase(createLabReport.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(analyzeLabReport.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(analyzeLabReport.fulfilled, (state, action) => {
                state.loading = false;
                // If the analysis returns a report object, we can set it as current, 
                // but usually we might want to redirect or just show success. 
                // The current implementation in NewLabReportPage redirects to list.
                // But if we want to show it immediately, we can set it.
                // However, the payload structure from analyzeLabReport is { message, data, aiAnalysis }.
                // So we should probably set state.currentReport = action.payload.data;
                // But let's check the thunk return type. It returns response.data.
            })
            .addCase(analyzeLabReport.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Delete Lab Report
            .addCase(deleteLabReport.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteLabReport.fulfilled, (state, action) => {
                state.loading = false;
                state.reports = state.reports.filter((report) => report._id !== action.payload);
                if (state.currentReport?._id === action.payload) {
                    state.currentReport = null;
                }
            })
            .addCase(deleteLabReport.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Fetch Lab Report By ID
            .addCase(fetchLabReportById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchLabReportById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentReport = action.payload;
            })
            .addCase(fetchLabReportById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearErrors } = labReportsSlice.actions;
export default labReportsSlice.reducer;
