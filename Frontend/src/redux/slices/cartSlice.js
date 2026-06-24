import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { logout } from "./authSlice";
import { API_URL as BASE_API_URL } from "../../utils/constants";

const API_URL = `${BASE_API_URL}/cart`;

// Async Thunks for Authenticated Users
export const fetchDBCart = createAsyncThunk(
  "cart/fetchDBCart",
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      console.log("[cartSlice] fetchDBCart action dispatched. API request sent.");
      if (!token) return thunkAPI.rejectWithValue("No token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(API_URL, config);
      console.log("[cartSlice] fetchDBCart API response received:", response.data);
      return response.data.cart.items;
    } catch (error) {
      console.error("[cartSlice] fetchDBCart error:", error);
      if (error.response?.status === 401) {
        console.warn("[cartSlice] 401 Unauthorized detected. Dispatching logout.");
        thunkAPI.dispatch(logout());
      }
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const addToDBCart = createAsyncThunk(
  "cart/addToDBCart",
  async ({ productId, quantity }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      console.log("[cartSlice] addToDBCart action dispatched. Product ID received:", productId);
      console.log("[cartSlice] addToDBCart API request sent with payload:", { productId, quantity });
      if (!token) return thunkAPI.rejectWithValue("No token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      // Call clean RESTful route: POST /api/cart
      const response = await axios.post(API_URL, { productId, quantity }, config);
      console.log("[cartSlice] addToDBCart API response received:", response.data);
      return response.data.cart.items;
    } catch (error) {
      console.error("[cartSlice] addToDBCart error:", error);
      if (error.response?.status === 401) {
        console.warn("[cartSlice] 401 Unauthorized detected. Dispatching logout.");
        thunkAPI.dispatch(logout());
      }
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateDBCartItem = createAsyncThunk(
  "cart/updateDBCartItem",
  async ({ productId, quantity }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      console.log("[cartSlice] updateDBCartItem action dispatched. Product ID received:", productId);
      console.log("[cartSlice] updateDBCartItem API request sent with payload:", { productId, quantity });
      if (!token) return thunkAPI.rejectWithValue("No token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      // Call clean RESTful route: PUT /api/cart
      const response = await axios.put(API_URL, { productId, quantity }, config);
      console.log("[cartSlice] updateDBCartItem API response received:", response.data);
      return response.data.cart.items;
    } catch (error) {
      console.error("[cartSlice] updateDBCartItem error:", error);
      if (error.response?.status === 401) {
        console.warn("[cartSlice] 401 Unauthorized detected. Dispatching logout.");
        thunkAPI.dispatch(logout());
      }
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const removeFromDBCart = createAsyncThunk(
  "cart/removeFromDBCart",
  async (productId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      console.log("[cartSlice] removeFromDBCart action dispatched. Product ID received:", productId);
      console.log("[cartSlice] removeFromDBCart API request sent.");
      if (!token) return thunkAPI.rejectWithValue("No token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      // Call clean RESTful route: DELETE /api/cart/:productId
      const response = await axios.delete(`${API_URL}/${productId}`, config);
      console.log("[cartSlice] removeFromDBCart API response received:", response.data);
      return response.data.cart.items;
    } catch (error) {
      console.error("[cartSlice] removeFromDBCart error:", error);
      if (error.response?.status === 401) {
        console.warn("[cartSlice] 401 Unauthorized detected. Dispatching logout.");
        thunkAPI.dispatch(logout());
      }
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const clearDBCart = createAsyncThunk(
  "cart/clearDBCart",
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      console.log("[cartSlice] clearDBCart action dispatched. API request sent.");
      if (!token) return thunkAPI.rejectWithValue("No token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      // Call clean RESTful route: DELETE /api/cart
      const response = await axios.delete(API_URL, config);
      console.log("[cartSlice] clearDBCart API response received:", response.data);
      return [];
    } catch (error) {
      console.error("[cartSlice] clearDBCart error:", error);
      if (error.response?.status === 401) {
        console.warn("[cartSlice] 401 Unauthorized detected. Dispatching logout.");
        thunkAPI.dispatch(logout());
      }
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const syncCartWithDB = createAsyncThunk(
  "cart/syncCartWithDB",
  async (localItems, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      console.log("[cartSlice] syncCartWithDB action dispatched. Local items received:", localItems);
      console.log("[cartSlice] syncCartWithDB API request sent.");
      if (!token) return thunkAPI.rejectWithValue("No token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.post(`${API_URL}/sync`, { items: localItems }, config);
      console.log("[cartSlice] syncCartWithDB API response received:", response.data);
      return response.data.cart.items;
    } catch (error) {
      console.error("[cartSlice] syncCartWithDB error:", error);
      if (error.response?.status === 401) {
        console.warn("[cartSlice] 401 Unauthorized detected. Dispatching logout.");
        thunkAPI.dispatch(logout());
      }
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// LocalStorage helpers
const normalizeCartItem = (item) => {
  if (!item) return null;

  const product = item.product && typeof item.product === "object"
    ? item.product
    : item.product
      ? { _id: item.product }
      : item;

  return {
    ...item,
    product,
    quantity: Number(item.quantity) || 1,
  };
};

const normalizeCartItems = (items) => {
  if (!Array.isArray(items)) return [];
  return items
    .map(normalizeCartItem)
    .filter(Boolean);
};

const loadLocalCart = () => {
  try {
    const serializedCart = localStorage.getItem("cartItems");
    if (serializedCart === null) return [];
    return normalizeCartItems(JSON.parse(serializedCart));
  } catch (err) {
    return [];
  }
};

const saveLocalCart = (items) => {
  try {
    localStorage.setItem("cartItems", JSON.stringify(normalizeCartItems(items)));
  } catch (err) {
    // ignore write errors
  }
};

const getProductId = (product) => {
  if (!product) return null;
  return product._id || product.id || product;
};

const initialState = {
  items: loadLocalCart(), // array of { product: { _id, name, price, images, stock... }, quantity }
  loading: false,
  error: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // Local Reducers for Guest Mode
    addToLocalCart: (state, action) => {
      console.log("[cartSlice] addToLocalCart action dispatched. Product received:", action.payload.product);
      const { product, quantity } = action.payload;
      const existingItem = state.items.find(
        (item) => getProductId(item.product) === getProductId(product)
      );

      if (existingItem) {
        existingItem.quantity += quantity;
        console.log("[cartSlice] Product already exists in local cart. Quantity incremented:", existingItem);
      } else {
        state.items.push({ product, quantity });
        console.log("[cartSlice] Product added to local cart as new item:", { product, quantity });
      }
      saveLocalCart(state.items);
      console.log("[cartSlice] LocalStorage updated with local cart items:", state.items);
    },
    updateLocalCartItem: (state, action) => {
      console.log("[cartSlice] updateLocalCartItem action dispatched:", action.payload);
      const { productId, quantity } = action.payload;
      const existingItem = state.items.find(
        (item) => getProductId(item.product) === productId
      );

      if (existingItem) {
        existingItem.quantity = quantity;
        console.log("[cartSlice] Local cart item quantity updated:", existingItem);
      }
      saveLocalCart(state.items);
      console.log("[cartSlice] LocalStorage updated with local cart items:", state.items);
    },
    removeFromLocalCart: (state, action) => {
      console.log("[cartSlice] removeFromLocalCart action dispatched. Product ID:", action.payload);
      state.items = state.items.filter(
        (item) => getProductId(item.product) !== action.payload
      );
      saveLocalCart(state.items);
      console.log("[cartSlice] LocalStorage updated with local cart items:", state.items);
    },
    clearLocalCart: (state) => {
      console.log("[cartSlice] clearLocalCart action dispatched.");
      state.items = [];
      saveLocalCart([]);
      console.log("[cartSlice] LocalStorage cleared.");
    },
    syncLocalCartToDB: (state, action) => {
      console.log("[cartSlice] syncLocalCartToDB action dispatched. Payload:", action.payload);
      state.items = action.payload;
      saveLocalCart(action.payload);
      console.log("[cartSlice] LocalStorage synchronized.");
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch DB Cart
      .addCase(fetchDBCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDBCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = normalizeCartItems(action.payload);
        console.log("[cartSlice] Cart state updated with DB items on fetchDBCart:", state.items);
        saveLocalCart(state.items);
        console.log("[cartSlice] LocalStorage updated on fetchDBCart:", state.items);
      })
      .addCase(fetchDBCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add to DB Cart
      .addCase(addToDBCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(addToDBCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = normalizeCartItems(action.payload);
        console.log("[cartSlice] Cart state updated with DB items on addToDBCart:", state.items);
        saveLocalCart(state.items);
        console.log("[cartSlice] LocalStorage updated on addToDBCart:", state.items);
      })
      .addCase(addToDBCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update DB Cart
      .addCase(updateDBCartItem.fulfilled, (state, action) => {
        state.items = normalizeCartItems(action.payload);
        console.log("[cartSlice] Cart state updated with DB items on updateDBCartItem:", state.items);
        saveLocalCart(state.items);
        console.log("[cartSlice] LocalStorage updated on updateDBCartItem:", state.items);
      })
      .addCase(updateDBCartItem.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Remove DB Cart
      .addCase(removeFromDBCart.fulfilled, (state, action) => {
        state.items = normalizeCartItems(action.payload);
        console.log("[cartSlice] Cart state updated with DB items on removeFromDBCart:", state.items);
        saveLocalCart(state.items);
        console.log("[cartSlice] LocalStorage updated on removeFromDBCart:", state.items);
      })
      .addCase(removeFromDBCart.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Clear DB Cart
      .addCase(clearDBCart.fulfilled, (state) => {
        state.items = [];
        console.log("[cartSlice] Cart state cleared on clearDBCart.");
        saveLocalCart([]);
        console.log("[cartSlice] LocalStorage cleared on clearDBCart.");
      })
      .addCase(clearDBCart.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Sync Cart with DB
      .addCase(syncCartWithDB.pending, (state) => {
        state.loading = true;
      })
      .addCase(syncCartWithDB.fulfilled, (state, action) => {
        state.loading = false;
        state.items = normalizeCartItems(action.payload);
        console.log("[cartSlice] Cart state updated with DB items on syncCartWithDB:", state.items);
        saveLocalCart(state.items);
        console.log("[cartSlice] LocalStorage updated on syncCartWithDB:", state.items);
      })
      .addCase(syncCartWithDB.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Listen to auth/logout to clear the cart slice immediately
      .addCase("auth/logout", (state) => {
        console.log("[cartSlice] auth/logout action detected. Clearing cart state and LocalStorage.");
        state.items = [];
        saveLocalCart([]);
      });
  },
});

export const {
  addToLocalCart,
  updateLocalCartItem,
  removeFromLocalCart,
  clearLocalCart,
  syncLocalCartToDB,
} = cartSlice.actions;

export default cartSlice.reducer;
