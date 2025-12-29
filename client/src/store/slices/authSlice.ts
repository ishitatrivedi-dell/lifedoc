import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { encrypt } from '@/utils/cryptoUtils';

// Types
interface User {
  id: string;
  name: string;
  email: string;
  age?: number;
  profile?: {
    gender?: string;
    height?: number;
    weight?: number;
    bloodGroup?: string;
    chronicConditions?: string[];
    photoUrl?: string;
    storyDesc?: string;
  };
  profileImage?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isInitialized: false,
  loading: false,
  error: null,
};

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async (
    { email, password, rememberMe }: { email: string; password: string; rememberMe: boolean },
    { rejectWithValue }
  ) => {
    try {
      const encryptedData = encrypt({ email, password });
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        encryptedData,
      });

      const { token, user } = response.data;

      // Store token (always in localStorage for 7-day persistence)
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
      }

      return { token, user };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const signupUser = createAsyncThunk(
  'auth/signup',
  async (
    { name, age, email, password }: { name: string; age: string; email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const encryptedData = encrypt({ name, age, email, password });
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/signup`, {
        encryptedData,
      });

      // Store pending email for OTP verification (only in browser)
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('pendingEmail', email);
      }

      return { email };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Signup failed');
    }
  }
);

export const verifyOTP = createAsyncThunk(
  'auth/verifyOTP',
  async ({ email, otp }: { email: string; otp: string }, { rejectWithValue }) => {
    try {
      const encryptedData = encrypt({ email, otp });
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-otp`, {
        encryptedData,
      });

      const { token, user } = response.data;

      // Store token (always in localStorage for 7-day persistence)
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);

        // Clear session data
        sessionStorage.removeItem('pendingEmail');
        sessionStorage.removeItem('rememberMe');
      }

      return { token, user };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'OTP verification failed');
    }
  }
);

export const fetchUserProfile = createAsyncThunk(
  'auth/fetchUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      // Check if we're in browser environment
      if (typeof window === 'undefined') {
        throw new Error('Not in browser environment');
      }

      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return { user: response.data.user, token };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'auth/updateUserProfile',
  async (
    userData: {
      name?: string;
      age?: string;
      gender?: string;
      height?: number;
      weight?: number;
      bloodGroup?: string;
      chronicConditions?: string[];
    },
    { rejectWithValue }
  ) => {
    try {
      if (typeof window === 'undefined') throw new Error('Not in browser environment');

      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, userData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return { user: response.data.user };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
    }
  }
);

export const uploadProfilePhoto = createAsyncThunk(
  'auth/uploadProfilePhoto',
  async (file: File, { rejectWithValue }) => {
    try {
      if (typeof window === 'undefined') throw new Error('Not in browser environment');

      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const formData = new FormData();
      formData.append('photo', file);

      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile/photo`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return { user: response.data.user };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to upload photo');
    }
  }
);

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  // Clear tokens (only in browser)
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
  }
  return null;
});

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
    setInitialized: (state) => {
      state.isInitialized = true;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Signup
    builder
      .addCase(signupUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Verify OTP
    builder
      .addCase(verifyOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch User Profile
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.isInitialized = true;
      })
      .addCase(fetchUserProfile.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.isInitialized = true;
      });

    // Update User Profile
    builder
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Upload Profile Photo
    builder
      .addCase(uploadProfilePhoto.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadProfilePhoto.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(uploadProfilePhoto.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Logout
    builder
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
      });
  },
});

export const { clearError, setCredentials, setInitialized } = authSlice.actions;
export default authSlice.reducer;
