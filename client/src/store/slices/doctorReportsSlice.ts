import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Types
export interface Prescription {
    _id?: string;
    medicine: string;
    dosage?: string;
    frequency?: string;
    duration?: string;
}

export interface DoctorReport {
    _id: string;
    userId: string;
    visitDate: string;
    doctorName?: string;
    diagnosis?: string[];
    prescriptions?: Prescription[];
    summary?: string;
    fileUrl?: string;
    followUpDate?: string;
    createdAt: string;
    updatedAt: string;
}

interface DoctorReportsState {
    reports: DoctorReport[];
    loading: boolean;
    error: string | null;
}

const initialState: DoctorReportsState = {
    reports: [],
    loading: false,
    error: null,
};

const getAuthHeader = () => {
    const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || sessionStorage.getItem('token')) : null;
    return { Authorization: `Bearer ${token}` };
};

// Async thunks
export const fetchDoctorReports = createAsyncThunk(
    'doctorReports/fetchAll',
    async (userId: string, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/doctor-reports/user/${userId}`, {
                headers: getAuthHeader(),
            });
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch doctor reports');
        }
    }
);

export const createDoctorReport = createAsyncThunk(
    'doctorReports/create',
    async (data: { userId: string; visitDate: string; doctorName?: string; diagnosis?: string[]; prescriptions?: Prescription[]; summary?: string; fileUrl?: string; followUpDate?: string }, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/doctor-reports`, data, {
                headers: getAuthHeader(),
            });
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create doctor report');
        }
    }
);

// Slice
const doctorReportsSlice = createSlice({
    name: 'doctorReports',
    initialState,
    reducers: {
        clearErrors: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchDoctorReports.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDoctorReports.fulfilled, (state, action) => {
                state.loading = false;
                state.reports = action.payload;
            })
            .addCase(fetchDoctorReports.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        builder
            .addCase(createDoctorReport.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createDoctorReport.fulfilled, (state, action) => {
                state.loading = false;
                state.reports.unshift(action.payload);
            })
            .addCase(createDoctorReport.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearErrors } = doctorReportsSlice.actions;
export default doctorReportsSlice.reducer;
