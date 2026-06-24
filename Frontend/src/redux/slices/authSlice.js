import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_URL } from "../../utils/constants";

// Helper to get token from local storage
const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user"));

const initialState = {
  user: user || null,
  token: token || null,
  isAuthenticated: !!token,
  loading: false,
  error: null,
  success: false,
  message: "",
};

// Async Thunks
export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData, thunkAPI) => {
    try {
      const response = await axios.post(`${API_URL}/auth/signup`, userData);
      if (response.data.success) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || "Registration failed";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (userData, thunkAPI) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, userData);
      if (response.data.success) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || "Login failed";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const loadUserProfile = createAsyncThunk(
  "auth/loadProfile",
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      const response = await axios.get(`${API_URL}/users/profile`, config);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (profileData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      const response = await axios.put(`${API_URL}/users/profile`, profileData, config);
      if (response.data.success) {
        // Update user in local storage
        const currentUser = JSON.parse(localStorage.getItem("user")) || {};
        const updatedUser = { ...currentUser, ...response.data.user };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const updatePassword = createAsyncThunk(
  "auth/updatePassword",
  async (passwords, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      const response = await axios.put(`${API_URL}/users/password`, passwords, config);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },
    clearAuthErrors: (state) => {
      state.error = null;
      state.success = false;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.success = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.success = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Load Profile
      .addCase(loadUserProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
      })
      .addCase(loadUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.success = true;
        state.message = "Profile updated successfully";
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Password
      .addCase(updatePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePassword.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message;
      })
      .addCase(updatePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearAuthErrors } = authSlice.actions;
export default authSlice.reducer;
