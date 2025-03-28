import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { loginUser as login, registerUser as register, users } from '../../utils/api';

// Get user from localStorage
const user = JSON.parse(localStorage.getItem('user'));
const token = localStorage.getItem('token');

const initialState = {
  user: user || null,
  token: token || null,
  isLoading: !user && !token, // Set initial loading state based on auth status
  isInitialized: false,
  error: null,
  following: [],
  followers: [],
};

// Initialize auth
export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async (_, thunkAPI) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const token = localStorage.getItem('token');
      return { user, token };
    } catch (error) {
      return thunkAPI.rejectWithValue('Failed to initialize auth');
    }
  }
);

// Follow user
export const followUserThunk = createAsyncThunk(
  'auth/followUser',
  async (userId, thunkAPI) => {
    try {
      const response = await users.follow(userId);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Unfollow user
export const unfollowUserThunk = createAsyncThunk(
  'auth/unfollowUser',
  async (userId, thunkAPI) => {
    try {
      const response = await users.unfollow(userId);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Auth actions
export const loginStart = () => ({ type: 'auth/loginStart' });
export const loginSuccess = (data) => ({ type: 'auth/loginSuccess', payload: data });
export const loginFail = (error) => ({ type: 'auth/loginFail', payload: error });

// Login user
export const loginUserThunk = createAsyncThunk(
  'auth/login',
  async (credentials, thunkAPI) => {
    try {
      const response = await login(credentials);
      if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data));
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Register user
export const registerUserThunk = createAsyncThunk(
  'auth/register',
  async (userData, thunkAPI) => {
    try {
      const response = await register(userData);
      if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data));
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update profile
export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, thunkAPI) => {
    try {
      const response = await users.updateProfile(profileData);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Logout user
export const logout = createAsyncThunk('auth/logout', async () => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
});

// Delete account
export const deleteAccountThunk = createAsyncThunk(
  'auth/deleteAccount',
  async (_, thunkAPI) => {
    try {
      const response = await users.deleteAccount();
      if (response.data) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUserThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUserThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.token = action.payload.token;
        state.isInitialized = true;
        state.error = null;
      })
      .addCase(loginUserThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isInitialized = true;
      })
      // Register
      .addCase(registerUserThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUserThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.token = action.payload.token;
        state.isInitialized = true;
        state.error = null;
      })
      .addCase(registerUserThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isInitialized = true;
      })
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem('user', JSON.stringify({ ...state.user, ...action.payload }));
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.error = null;
        state.isInitialized = true;
      })
      // Follow User
      .addCase(followUserThunk.fulfilled, (state, action) => {
        if (state.user) {
          const { following } = action.payload;
          state.user = {
            ...state.user,
            following
          };
          localStorage.setItem('user', JSON.stringify(state.user));
        }
      })
      .addCase(followUserThunk.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Unfollow User
      .addCase(unfollowUserThunk.fulfilled, (state, action) => {
        if (state.user) {
          const { following } = action.payload;
          state.user = {
            ...state.user,
            following
          };
          localStorage.setItem('user', JSON.stringify(state.user));
        }
      })
      .addCase(unfollowUserThunk.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Delete Account
      .addCase(deleteAccountThunk.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.error = null;
        state.isInitialized = true;
      })
      .addCase(deleteAccountThunk.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Initialize Auth
      .addCase(initializeAuth.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isInitialized = true;
        state.error = null;
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.isInitialized = true;
        state.error = null;
      });
  },
});

// Selectors
export const getCurrentUser = (state) => state.auth.user;

export const { reset } = authSlice.actions;
export default authSlice.reducer;
