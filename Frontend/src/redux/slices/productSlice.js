import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_URL } from "../../utils/constants";

const initialState = {
  products: [],
  productsCount: 0,
  resPerPage: 8,
  filteredProductsCount: 0,
  page: 1,
  pages: 1,
  totalProducts: 0,
  product: null,
  categories: [],
  loading: false,
  error: null,
  success: false,
  reviewSuccess: false,
};

// Async Thunks
export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async (queryParams = "", thunkAPI) => {
    try {
      // queryParams is a query string, e.g. "?keyword=laptop&price[gte]=100&page=2"
      const response = await axios.get(`${API_URL}/products${queryParams}`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchProductDetails = createAsyncThunk(
  "products/fetchDetails",
  async (id, thunkAPI) => {
    try {
      const response = await axios.get(`${API_URL}/products/${id}`);
      return response.data.product;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchCategories = createAsyncThunk(
  "products/fetchCategories",
  async (_, thunkAPI) => {
    try {
      const response = await axios.get(`${API_URL}/categories`);
      return response.data.categories;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const createProduct = createAsyncThunk(
  "products/createProduct",
  async (productData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.post(`${API_URL}/products`, productData, config);
      return response.data.product;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateProduct = createAsyncThunk(
  "products/updateProduct",
  async ({ id, productData }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.put(`${API_URL}/products/${id}`, productData, config);
      return response.data.product;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deleteProduct = createAsyncThunk(
  "products/deleteProduct",
  async (id, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`${API_URL}/products/${id}`, config);
      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const addProductReview = createAsyncThunk(
  "products/addReview",
  async (reviewData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.put(`${API_URL}/products/review`, reviewData, config);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    clearProductErrors: (state) => {
      state.error = null;
      state.success = false;
      state.reviewSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products;
        state.page = action.payload.page || 1;
        state.pages = action.payload.pages || 1;
        state.totalProducts = action.payload.totalProducts || 0;
        state.productsCount = action.payload.totalProducts || action.payload.productsCount || 0;
        state.resPerPage = action.payload.resPerPage || 8;
        state.filteredProductsCount = action.payload.totalProducts || action.payload.filteredProductsCount || 0;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Details
      .addCase(fetchProductDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.product = action.payload;
      })
      .addCase(fetchProductDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Categories
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      })
      // Create Product
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.products.push(action.payload);
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Product
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const index = state.products.findIndex((p) => p._id === action.payload._id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
        state.product = action.payload;
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Product
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.products = state.products.filter((p) => p._id !== action.payload);
        state.success = true;
      })
      // Add Review
      .addCase(addProductReview.fulfilled, (state) => {
        state.reviewSuccess = true;
      })
      .addCase(addProductReview.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearProductErrors } = productSlice.actions;
export default productSlice.reducer;
