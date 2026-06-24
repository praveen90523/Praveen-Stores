import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_URL as BASE_API_URL } from "../../utils/constants";

const API_URL = `${BASE_API_URL}/orders`;

const initialState = {
  orders: [],
  order: null,
  loading: false,
  error: null,
  success: false,
  paymentSuccess: false,
  razorpayOrder: null,
};

// Async Thunks
export const createRazorpayOrder = createAsyncThunk(
  "orders/createRazorpayOrder",
  async (amount, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.post(`${API_URL}/pay`, { amount }, config);
      return response.data.order; // Razorpay order object
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const verifyRazorpayPayment = createAsyncThunk(
  "orders/verifyPayment",
  async (paymentDetails, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.post(`${API_URL}/verify`, paymentDetails, config);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const createDBOrder = createAsyncThunk(
  "orders/createDBOrder",
  async (orderData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.post(`${API_URL}/new`, orderData, config);
      return response.data.order;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchMyOrders = createAsyncThunk(
  "orders/fetchMyOrders",
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(`${API_URL}/me`, config);
      return response.data.orders;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchOrderDetails = createAsyncThunk(
  "orders/fetchDetails",
  async (id, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(`${API_URL}/${id}`, config);
      return response.data.order;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchAllOrdersAdmin = createAsyncThunk(
  "orders/fetchAllAdmin",
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(`${API_URL}/admin/all`, config);
      return response.data.orders;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateOrderStatusAdmin = createAsyncThunk(
  "orders/updateStatusAdmin",
  async ({ id, status }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.put(`${API_URL}/admin/${id}`, { status }, config);
      return response.data.order;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const cancelUserOrder = createAsyncThunk(
  "orders/cancelOrder",
  async (id, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.put(`${API_URL}/cancel/${id}`, {}, config);
      return response.data.order;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    clearOrderErrors: (state) => {
      state.error = null;
      state.success = false;
      state.paymentSuccess = false;
    },
    resetRazorpayOrder: (state) => {
      state.razorpayOrder = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Razorpay Order
      .addCase(createRazorpayOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRazorpayOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.razorpayOrder = action.payload;
      })
      .addCase(createRazorpayOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Verify Payment
      .addCase(verifyRazorpayPayment.pending, (state) => {
        state.loading = true;
      })
      .addCase(verifyRazorpayPayment.fulfilled, (state) => {
        state.loading = false;
        state.paymentSuccess = true;
      })
      .addCase(verifyRazorpayPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create DB Order
      .addCase(createDBOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(createDBOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.order = action.payload;
        state.orders.unshift(action.payload);
      })
      .addCase(createDBOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch My Orders
      .addCase(fetchMyOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchMyOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Details
      .addCase(fetchOrderDetails.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchOrderDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload;
      })
      .addCase(fetchOrderDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Admin: Fetch All
      .addCase(fetchAllOrdersAdmin.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllOrdersAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchAllOrdersAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Admin: Update Status
      .addCase(updateOrderStatusAdmin.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.orders.findIndex((o) => o._id === action.payload._id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
        if (state.order?._id === action.payload._id) {
          state.order = action.payload;
        }
      })
      // Cancel Order
      .addCase(cancelUserOrder.fulfilled, (state, action) => {
        const index = state.orders.findIndex((o) => o._id === action.payload._id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
        if (state.order?._id === action.payload._id) {
          state.order = action.payload;
        }
        state.success = true;
      });
  },
});

export const { clearOrderErrors, resetRazorpayOrder } = orderSlice.actions;
export default orderSlice.reducer;
